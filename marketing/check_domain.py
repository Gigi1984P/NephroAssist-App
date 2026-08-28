#!/usr/bin/env python3
"""Check .com domain availability using RDAP (authoritative) with rate-limiting + DNS fallback via Python socket."""

import socket
import subprocess
import sys
import time


def check_rdap(domain: str) -> tuple[bool, str]:
    clean = domain.strip().lower().removesuffix(".com")
    fqdn = f"{clean}.com"
    rdap_url = f"https://rdap.org/domain/{fqdn}"
    try:
        result = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-L", "-m", "10", rdap_url],
            capture_output=True,
            text=True,
            timeout=15,
        )
        code = result.stdout.strip()
        if code == "404":
            return True, f"RDAP 404 (not found)"
        elif code == "200":
            return False, f"RDAP 200 (exists)"
        else:
            return False, f"RDAP HTTP {code}"
    except Exception as e:
        return False, f"RDAP error: {e}"


def check_dns_a(domain: str) -> tuple[bool, str]:
    clean = domain.strip().lower().removesuffix(".com")
    fqdn = f"{clean}.com"
    try:
        socket.gethostbyname(fqdn)
        return True, "DNS A record exists"
    except socket.gaierror:
        return False, "No DNS A record"
    except Exception as e:
        return False, f"DNS error: {e}"


def check_dns_ns(domain: str) -> tuple[bool, str]:
    clean = domain.strip().lower().removesuffix(".com")
    fqdn = f"{clean}.com"
    try:
        result = subprocess.run(
            ["python3", "-c", f"import socket; print(socket.getaddrinfo('{fqdn}', None, socket.AF_INET, socket.SOCK_STREAM))"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if "gaierror" in result.stderr:
            return False, "No DNS records"
        return True, "DNS resolution succeeded"
    except Exception as e:
        return False, f"DNS error: {e}"


def main():
    domains = sys.argv[1:]
    if not domains:
        print("Usage: python3 check_domain.py <domain1> [domain2] ...")
        sys.exit(1)

    for d in domains:
        clean = d.strip().lower().removesuffix(".com")
        print(f"\n--- {clean}.com ---")
        rdap_avail, rdap_msg = check_rdap(clean)
        dns_a_has, dns_a_msg = check_dns_a(clean)
        print(f"  RDAP: {rdap_msg}")
        print(f"  DNS A: {dns_a_msg}")

        if rdap_avail and not dns_a_has:
            print(f"  => AVAILABLE (RDAP 404 + no DNS)")
        elif not rdap_avail and dns_a_has:
            print(f"  => TAKEN (RDAP exists + DNS found)")
        elif rdap_avail and dns_a_has:
            print(f"  => UNCLEAR (RDAP 404 but DNS exists — possible lag or reserved)")
        else:
            print(f"  => LIKELY TAKEN (RDAP found, no DNS — could be parked/expiring)")
        time.sleep(1.0)


if __name__ == "__main__":
    main()
