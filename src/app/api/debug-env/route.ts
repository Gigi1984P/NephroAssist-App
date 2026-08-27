import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    emailFrom: process.env.EMAIL_FROM || "nicht gesetzt",
    hasResendKey: !!process.env.RESEND_API_KEY,
    envLoaded: true,
  });
}
