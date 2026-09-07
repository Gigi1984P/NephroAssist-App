"use client";

import { useEffect } from "react";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export default function CsrfProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = function (...args: [RequestInfo | URL, RequestInit?]) {
      const [input, init] = args;
      let url = "";
      if (typeof input === "string") {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else if (input instanceof URL) {
        url = input.toString();
      }

      const method = (init?.method || "GET").toUpperCase();

      // Only add CSRF token to same-origin state-changing API requests
      if (
        STATE_CHANGING_METHODS.has(method) &&
        url.startsWith("/api/")
      ) {
        const csrfToken = getCookie("csrf-token");
        if (csrfToken) {
          const headers = new Headers(init?.headers || {});
          if (!headers.has("x-csrf-token")) {
            headers.set("x-csrf-token", csrfToken);
          }
          return originalFetch(input, { ...init, headers } as RequestInit);
        }
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}
