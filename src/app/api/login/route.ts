import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { SECRET_BYTES } from "@/lib/config";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, getTwoFactorEmail } from "@/lib/email";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generate2FACode(): string {
  // 6-stelliger numerischer Code
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request: Request) {
  try {
    const limit = rateLimit(request);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await request.json();
    const { email, password, code, stage } = body;

    // ── STAGE 1: E-Mail + Passwort prüfen, Code senden ──
    if (stage === "request" || !stage) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, role: true, password: true, emailVerified: true, twoFactorEnabled: true },
      });

      if (!user || !user.password) {
        return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 });
      }

      // Demo-Zugangsdaten: Email-Verifizierung + 2FA überspringen
      const DEMO_EMAILS = [
        "admin@nephroassist.de",
        "koordinator@nephroassist.de",
        "arzt@nephroassist.de",
        "patient@beispiel.de",
        "dialyse@beispiel.de",
        "transplant@beispiel.de",
        "angehorige@beispiel.de",
      ];
      const isDemo = DEMO_EMAILS.includes(user.email);

      if (!user.emailVerified && !isDemo) {
        return NextResponse.json(
          { error: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse." },
          { status: 403 }
        );
      }

      // Wenn 2FA nicht aktiv ODER Demo-Account, direkt einloggen
      if (!user.twoFactorEnabled || isDemo) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
        const ua = request.headers.get("user-agent") || "";
        await prisma.loginHistory.create({
          data: { userId: user.id, ipAddress: ip, userAgent: ua, success: true },
        });

        const token = await new SignJWT({
          sub: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .sign(SECRET_BYTES);

        const response = NextResponse.json({
          success: true,
          user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });

        response.cookies.set("nephro-token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });

        return response;
      }

      // 2FA ist aktiv: Code generieren und per E-Mail senden
      const twoFactorCode = generate2FACode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 Minuten gültig

      // Alte Codes löschen
      await prisma.twoFactorCode.deleteMany({ where: { userId: user.id } });

      // Neuen Code speichern
      await prisma.twoFactorCode.create({
        data: {
          userId: user.id,
          code: twoFactorCode,
          expiresAt,
        },
      });

      // Code per E-Mail senden
      await sendEmail({
        to: user.email,
        subject: "🔐 Ihr Bestätigungscode – NephroAssist",
        html: `
          \u003cdiv style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            \u003ch2 style="color: #1e40af;">🔐 Zwei-Faktor-Authentifizierung\u003c/h2\u003e
            \u003cp\u003eHallo ${user.name || user.email},\u003c/p\u003e
            \u003cp\u003eSie haben sich gerade bei NephroAssist angemeldet. Hier ist Ihr Bestätigungscode:\u003c/p\u003e
            \u003cdiv style="background: #eff6ff; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
              \u003cspan style="font-size: 2.5rem; font-weight: bold; letter-spacing: 8px; color: #1e40af; font-family: monospace;">
                ${twoFactorCode}
              \u003c/span\u003e
            \u003c/div\u003e
            \u003cp style="color: #64748b; font-size: 0.9em;">
              ⏰ Dieser Code ist \u003cstrong\u003e10 Minuten\u003c/strong\u003e gültig.
            \u003c/p\u003e
            \u003cp style="color: #64748b; font-size: 0.85em;">
              Wenn Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail.
            \u003c/p\u003e
            \u003cbr\u003e
            \u003cp\u003eMit freundlichen Grüßen,\u003cbr\u003eIhr NephroAssist-Team\u003c/p\u003e
          \u003c/div\u003e
        `,
      });

      return NextResponse.json({
        twoFactorRequired: true,
        message: "Bitte geben Sie den Code ein, den wir an Ihre E-Mail gesendet haben.",
      });
    }

    // ── STAGE 2: 2FA-Code verifizieren ──
    if (stage === "verify") {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true },
      });

      if (!user || !user.twoFactorEnabled) {
        return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
      }

      const twoFactorRecord = await prisma.twoFactorCode.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (!twoFactorRecord) {
        return NextResponse.json({ error: "Kein Code gefunden. Bitte melden Sie sich erneut an." }, { status: 400 });
      }

      if (twoFactorRecord.expiresAt < new Date()) {
        await prisma.twoFactorCode.delete({ where: { id: twoFactorRecord.id } });
        return NextResponse.json({ error: "Code abgelaufen. Bitte melden Sie sich erneut an." }, { status: 400 });
      }

      if (twoFactorRecord.attempts >= 5) {
        return NextResponse.json({ error: "Zu viele Versuche. Bitte melden Sie sich erneut an." }, { status: 429 });
      }

      if (twoFactorRecord.code !== code) {
        await prisma.twoFactorCode.update({
          where: { id: twoFactorRecord.id },
          data: { attempts: { increment: 1 } },
        });
        return NextResponse.json({ error: "Ungültiger Code. Bitte versuchen Sie es erneut." }, { status: 401 });
      }

      // Code gültig: Löschen und einloggen
      await prisma.twoFactorCode.delete({ where: { id: twoFactorRecord.id } });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
      const ua = request.headers.get("user-agent") || "";
      await prisma.loginHistory.create({
        data: { userId: user.id, ipAddress: ip, userAgent: ua, success: true },
      });

      const token = await new SignJWT({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(SECRET_BYTES);

      const response = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });

      response.cookies.set("nephro-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Ungültige Stage" }, { status: 400 });
  } catch (error) {
    console.error("[LOGIN-API] Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten", details: message }, { status: 500 });
  }
}
