#!/usr/bin/env python3
"""WHOIS check on port 43 for .com domains via Verisign GRS."""
import socket
import sys


def whois(domain: str) -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(10)
    s.connect(("whois.verisign-grs.com", 43))
    s.sendall((domain + "\r\n").encode())
    data = b""
    while True:
        chunk = s.recv(4096)
        if not chunk:
            break
        data += chunk
    s.close()
    return data.decode("utf-8", errors="ignore")


def main():
    for d in sys.argv[1:]:
        print(f"\n=== WHOIS for {d}.com ===")
        resp = whois(f"{d}.com")
        print(resp[:2000])
        if "No match for" in resp or "NOT FOUND" in resp.upper():
            print("-=-> NOT FOUND / AVAILABLE")
        elif "clientHold" in resp or "serverHold" in resp:
            print("-=-> ON HOLD (not available)")
        elif "reserved" in resp.lower():
            print("-=-> RESERVED")
        else:
            print("-=-> EXISTING / TAKEN")


if __name__ == "__main__":
    main()
