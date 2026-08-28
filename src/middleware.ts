import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SECRET_BYTES } from "@/lib/config";

function getToken(req: NextRequest): string | undefined {
  return req.cookies.get("nephro-token")?.value;
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const token = getToken(req);

  let isLoggedIn = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET_BYTES, { clockTolerance: 60 });
      isLoggedIn = true;
    } catch {
      isLoggedIn = false;
    }
  }

  const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isOnAuth = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  if (isOnDashboard) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.next();
  }

  if (isOnAuth) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register"],
};
