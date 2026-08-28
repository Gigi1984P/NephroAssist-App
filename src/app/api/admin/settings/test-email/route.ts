import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { to, provider } = body;

    if (!to) {
      return NextResponse.json({ error: "Empfänger-E-Mail fehlt" }, { status: 400 });
    }

    const result = await sendEmail({
      to,
      subject: "🧪 NephroAssist Test-E-Mail",
      html: `
        \u003cdiv style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"\u003e
          \u003ch2 style="color: #3b82f6;"\u003e🧪 Test-E-Mail\u003c/h2\u003e
          \u003cp\u003eHallo ${session.user.name || ""},\u003c/p\u003e
          \u003cp\u003eDies ist eine Test-E-Mail von NephroAssist.\u003c/p\u003e
          \u003cp\u003e\u003cstrong\u003eProvider:\u003c/strong\u003e ${provider || "Standard"}\u003c/p\u003e
          \u003cp\u003e\u003cstrong\u003eZeitpunkt:\u003c/strong\u003e ${new Date().toLocaleString("de-DE")}\u003c/p\u003e
          \u003cbr\u003e
          \u003cp\u003eWenn du diese E-Mail empfangen hast, funktioniert der E-Mail-Versand korrekt.\u003c/p\u003e
          \u003cp\u003eMit freundlichen Grüßen,\u003cbr\u003eIhr NephroAssist-Team\u003c/p\u003e
        \u003c/div\u003e
      `,
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: "Test-E-Mail gesendet", provider: provider || "resend" });
    } else {
      return NextResponse.json({ success: false, error: result.error || "Unbekannter Fehler" }, { status: 500 });
    }
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json({ error: "Fehler beim Senden" }, { status: 500 });
  }
}
