import { NextResponse } from "next/server";

export const runtime = "edge";

/* ================================================================ */
/*  POST: Content Security Policy violation report endpoint           */
/* ================================================================ */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const report = body["csp-report"] || body;

    // Log CSP violation for monitoring (avoid logging in production if noisy)
    console.warn("[CSP-VIOLATION]", JSON.stringify(report));

    // Optionally persist to database or external monitoring service here
    return NextResponse.json({ received: true }, { status: 204 });
  } catch {
    return NextResponse.json({ received: true }, { status: 204 });
  }
}
