import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-Mail-Adresse ist erforderlich" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether user exists
      return NextResponse.json(
        { message: "Falls ein Konto mit dieser E-Mail existiert, wurde eine Reset-E-Mail gesendet." },
        { status: 200 }
      );
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "https://nephro-assist-app-pied.vercel.app"}/reset-password/${token}`;

    await sendEmail({
      to: email,
      subject: "Passwort zurücksetzen – NephroAssist",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Passwort zurücksetzen</h2>
          <p>Hallo ${user.name || ""},</p>
          <p>Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den folgenden Link, um ein neues Passwort zu vergeben:</p>
          <p style="margin-top: 20px;">
            <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Passwort zurücksetzen
            </a>
          </p>
          <p style="margin-top: 20px; font-size: 0.9em; color: #64748b;">
            Dieser Link ist <strong>1 Stunde</strong> gültig. Wenn Sie kein Passwort-Reset angefordert haben, ignorieren Sie diese E-Mail bitte.
          </p>
          <p style="font-size: 0.9em; color: #64748b;">
            Mit freundlichen Grüßen,<br/>Ihr NephroAssist-Team
          </p>
        </div>
      `,
      text: `Passwort zurücksetzen\n\nHallo ${user.name || ""},\n\nSie haben angefordert, Ihr Passwort zurückzusetzen. Öffnen Sie folgenden Link:\n${resetUrl}\n\nDieser Link ist 1 Stunde gültig.\n\nMit freundlichen Grüßen,\nIhr NephroAssist-Team`,
    });

    return NextResponse.json(
      { message: "Falls ein Konto mit dieser E-Mail existiert, wurde eine Reset-E-Mail gesendet." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[FORGOT-PASSWORD] Error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
