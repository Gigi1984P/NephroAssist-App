import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hasKey = !!process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "NephroAssist <noreply@nephroassist.de>";

    if (!hasKey) {
      return NextResponse.json({
        status: "MISSING_KEY",
        message: "RESEND_API_KEY nicht gesetzt",
        env: { hasResendKey: hasKey, emailFrom: from },
      }, { status: 500 });
    }

    // Test-E-Mail an Resend Test-Empfänger
    const result = await sendEmail({
      to: "delivered@resend.dev",
      subject: "🧪 NephroAssist E-Mail Test",
      html: "<p>Dies ist ein Test von NephroAssist.</p><p>Wenn Sie das lesen, funktioniert Resend.</p>",
      text: "Dies ist ein Test von NephroAssist. Wenn Sie das lesen, funktioniert Resend.",
    });

    return NextResponse.json({
      status: result.success ? "SENT" : "FAILED",
      resendResult: result,
      env: { hasResendKey: hasKey, emailFrom: from },
    });
  } catch (error) {
    return NextResponse.json({
      status: "ERROR",
      error: String(error),
    }, { status: 500 });
  }
}
