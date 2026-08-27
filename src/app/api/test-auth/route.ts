import { NextResponse } from "next/server";
import { auth, authFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const sessionCookies = await auth();
    const sessionRequest = await authFromRequest(request);
    
    const cookieHeader = request.headers.get("cookie") || "keine";
    
    return NextResponse.json({
      authCookies: sessionCookies ? "OK" : "NULL",
      authRequest: sessionRequest ? "OK" : "NULL",
      cookieHeaderLength: cookieHeader.length,
      hasNephroToken: cookieHeader.includes("nephro-token"),
      hasSessionToken: cookieHeader.includes("next-auth") || cookieHeader.includes("__session"),
      cookieNames: cookieHeader.split(";").map(c => c.trim().split("=")[0]).filter(Boolean),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
