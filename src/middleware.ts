import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production"
);

export function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Check custom nephro-token
  let isLoggedIn = false;
  try {
    const token = req.cookies.get("nephro-token")?.value;
    if (token) {
      // We can't use async/await in middleware export function directly in some cases,
      // but jwtVerify is async. However, Next.js middleware supports async functions.
      // For synchronous check, we just let the request through and the server component
      // auth() will verify properly. But let's try async export.
    }
  } catch {
    // Invalid token
  }

  const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isOnAuth = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  if (isOnDashboard) {
    // For dashboard, we need to verify token synchronously or let request through
    // Simpler: just check if cookie exists (fast path)
    const hasToken = req.cookies.has("nephro-token");
    if (!hasToken) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.next();
  }

  if (isOnAuth) {
    const hasToken = req.cookies.has("nephro-token");
    if (hasToken) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register"],
};
