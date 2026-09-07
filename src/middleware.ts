import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SECRET_BYTES } from "@/lib/config";
import crypto from "crypto";

function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getToken(req: NextRequest): string | undefined {
  return req.cookies.get("nephro-token")?.value;
}

// Paths that require admin role
const ADMIN_PATHS = ["/dashboard/admin", "/dashboard/cms"];

// Public paths (no auth required)
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/legal", "/passport", "/upload"];

// API paths excluded from CSRF verification (auth endpoints, webhooks, etc.)
const CSRF_EXEMPT_PATHS = ["/api/login", "/api/auth", "/api/csp-report", "/api/cron", "/api/debug-login", "/api/logout"];

// State-changing methods that require CSRF verification
const STATE_CHANGING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

function buildCSPHeader(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "report-uri /api/csp-report",
  ];
  return directives.join("; ");
}

function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
  );
  response.headers.set("Content-Security-Policy", buildCSPHeader());
  return response;
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const token = getToken(req);

  let isLoggedIn = false;
  let userRole: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_BYTES, { clockTolerance: 60 });
      isLoggedIn = true;
      userRole = payload.role as string | null;
    } catch {
      isLoggedIn = false;
    }
  }

  const pathname = nextUrl.pathname;

  // Check if path is public
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Dashboard / protected paths
  const isProtected = pathname.startsWith("/dashboard") || pathname === "/";

  if (isProtected) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Admin role check
    const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
    if (isAdminPath && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Add security headers
    const response = NextResponse.next();
    return setSecurityHeaders(response);
  }

  // Auth pages: redirect logged-in users away
  if (isPublic && isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // CSRF verification for state-changing API requests
  if (pathname.startsWith("/api/") && STATE_CHANGING_METHODS.includes(req.method)) {
    const isExempt = CSRF_EXEMPT_PATHS.some((p) => pathname.startsWith(p));
    if (!isExempt) {
      const csrfCookie = req.cookies.get("csrf-token")?.value;
      const csrfHeader = req.headers.get("x-csrf-token") || "";

      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return NextResponse.json(
          { error: "Ungültiges oder fehlendes CSRF-Token" },
          { status: 403 }
        );
      }
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  return setSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
    "/verify-email/:path*",
    "/api/:path*",
  ],
};
