import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SECRET_BYTES } from "@/lib/config";

function getToken(req: NextRequest): string | undefined {
  return req.cookies.get("nephro-token")?.value;
}

// Paths that require admin role
const ADMIN_PATHS = ["/dashboard/admin"];

// Public paths (no auth required)
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/legal", "/passport", "/upload"];

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
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    return response;
  }

  // Auth pages: redirect logged-in users away
  if (isPublic && isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
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
  ],
};
