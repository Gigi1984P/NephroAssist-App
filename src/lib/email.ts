import { Resend } from "resend";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { prisma } from "./prisma";

let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function getEmailConfig(): Promise<Record<string, string | null>> {
  try {
    const configs = await prisma.systemConfig.findMany({
      where: { category: "email" },
    });
    const map: Record<string, string | null> = {};
    for (const c of configs) {
      map[c.key] = c.value;
    }
    return map;
  } catch {
    return {};
  }
}

export async function sendEmail(
  payload: EmailPayload
): Promise<{ success: boolean; error?: string; logged?: boolean; resultId?: string }> {
  const cfg = await getEmailConfig();

  const provider = cfg["EMAIL_PROVIDER"] || (process.env.SMTP_HOST ? "smtp" : "resend");
  const from = cfg["EMAIL_FROM"] || process.env.EMAIL_FROM || "onboarding@resend.dev";
  const isEnabled = cfg["EMAIL_ENABLED"] === "true" || (!cfg["EMAIL_ENABLED"] && !!process.env.RESEND_API_KEY);

  if (!isEnabled) {
    console.warn("=".repeat(60));
    console.warn("📧 E-MAIL VERSAND – DEAKTIVIERT");
    console.warn("   EMAIL_ENABLED ist false oder nicht konfiguriert.");
    console.warn("=".repeat(60));
    return { success: false, error: "E-Mail-Versand ist deaktiviert", logged: true };
  }

  // ── SMTP ──
  if (provider === "smtp") {
    const host = cfg["SMTP_HOST"] || process.env.SMTP_HOST;
    if (!host) {
      return { success: false, error: "SMTP-Host nicht konfiguriert" };
    }

    const port = parseInt(cfg["SMTP_PORT"] || process.env.SMTP_PORT || "587", 10);
    const secure = cfg["SMTP_SECURE"] === "true" || (port === 465);
    const user = cfg["SMTP_USER"] || process.env.SMTP_USER || "";
    const pass = cfg["SMTP_PASS"] || process.env.SMTP_PASS || "";

    const transportOptions: SMTPTransport.Options = {
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
      tls: !secure ? { rejectUnauthorized: false } : undefined,
    };

    const transporter = nodemailer.createTransport(transportOptions);

    try {
      const result = await transporter.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text || payload.html.replace(/\u003c[^\u003e]*\u003e/g, ""),
      });
      console.log("✅ E-Mail via SMTP gesendet:", result.messageId);
      return { success: true, resultId: result.messageId || undefined };
    } catch (error: any) {
      console.error("❌ SMTP-Versand fehlgeschlagen:", error.message);
      return { success: false, error: `SMTP-Fehler: ${error.message}` };
    }
  }

  // ── RESEND (Default) ──
  if (!resend) {
    console.warn("=".repeat(60));
    console.warn("📧 E-MAIL VERSAND – RESEND NICHT KONFIGURIERT");
    console.warn("   Füge RESEND_API_KEY zu den Environment-Variablen hinzu.");
    console.warn("   Resend: https://resend.com  (kostenlos bis 3.000 E-Mails/Tag)");
    console.warn("=".repeat(60));
    console.warn("An:", payload.to);
    console.warn("Betreff:", payload.subject);
    console.warn("Text:\n" + (payload.text || payload.html.replace(/\u003c[^\u003e]*\u003e/g, "")));
    console.warn("=".repeat(60));
    return { success: false, error: "E-Mail-Service nicht konfiguriert (RESEND_API_KEY fehlt)", logged: true };
  }

  try {
    const result = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text || payload.html.replace(/\u003c[^\u003e]*\u003e/g, ""),
    });
    console.log("✅ E-Mail via Resend gesendet:", (result as any)?.id || "OK");
    return { success: true, resultId: (result as any)?.id };
  } catch (error) {
    console.error("E-Mail-Versand fehlgeschlagen:", error);
    return { success: false, error: String(error) };
  }
}

// ── Email Templates ──

export function getTaskCompletionEmail(patientName: string, taskName: string): { subject: string; html: string } {
  return {
    subject: `✅ Schritt erledigt: ${taskName}`,
    html: `
      \u003ch2\u003eSchritt erledigt\u003c/h2\u003e
      \u003cp\u003eHallo ${patientName},\u003c/p\u003e
      \u003cp\u003eSie haben den Schritt \u003cstrong\u003e"${taskName}"\u003c/strong\u003e erfolgreich abgeschlossen.\u003c/p\u003e
      \u003cp\u003eDer nächste Schritt steht jetzt zur Verfügung.\u003c/p\u003e
      \u003cp\u003e\u003ca href="https://nephro-assist-app-pied.vercel.app/dashboard/tasks"\u003eZur Untersuchungsübersicht →\u003c/a\u003e\u003c/p\u003e
      \u003cbr\u003e
      \u003cp\u003eMit freundlichen Grüßen,\u003cbr\u003eIhr NephroAssist-Team\u003c/p\u003e
    `,
  };
}

export function getUploadNotificationEmail(patientName: string, documentName: string): { subject: string; html: string } {
  return {
    subject: `📄 Neues Dokument hochgeladen`,
    html: `
      \u003ch2\u003eNeues Dokument hochgeladen\u003c/h2\u003e
      \u003cp\u003eHallo,\u003c/p\u003e
      \u003cp\u003e${patientName} hat das Dokument \u003cstrong\u003e"${documentName}"\u003c/strong\u003e hochgeladen.\u003c/p\u003e
      \u003cp\u003eBitte prüfen Sie das Dokument in der Review-Queue.\u003c/p\u003e
      \u003cp\u003e\u003ca href="https://nephro-assist-app-pied.vercel.app/dashboard/documents"\u003eZur Dokumenten-Review →\u003c/a\u003e\u003c/p\u003e
      \u003cbr\u003e
      \u003cp\u003eMit freundlichen Grüßen,\u003cbr\u003eIhr NephroAssist-Team\u003c/p\u003e
    `,
  };
}

export function getHelpRequestEmail(patientName: string, helpType: string, description: string): { subject: string; html: string } {
  return {
    subject: `🆘 Hilfeanfrage von ${patientName}`,
    html: `
      \u003ch2\u003eNeue Hilfeanfrage\u003c/h2\u003e
      \u003cp\u003e\u003cstrong\u003ePatient:\u003c/strong\u003e ${patientName}\u003c/p\u003e
      \u003cp\u003e\u003cstrong\u003eTyp:\u003c/strong\u003e ${helpType}\u003c/p\u003e
      \u003cp\u003e\u003cstrong\u003eBeschreibung:\u003c/strong\u003e\u003c/p\u003e
      \u003cblockquote\u003e${description}\u003c/blockquote\u003e
      \u003cp\u003e\u003ca href="https://nephro-assist-app-pied.vercel.app/dashboard/help-requests"\u003eZur Hilfeanfragen-Übersicht →\u003c/a\u003e\u003c/p\u003e
      \u003cbr\u003e
      \u003cp\u003eMit freundlichen Grüßen,\u003cbr\u003eIhr NephroAssist-Team\u003c/p\u003e
    `,
  };
}

export function getExpirationReminderEmail(patientName: string, requirementName: string, daysLeft: number): { subject: string; html: string } {
  return {
    subject: `⏰ Erinnerung: ${requirementName} läuft in ${daysLeft} Tagen ab`,
    html: `
      \u003ch2\u003eUntersuchung läuft bald ab\u003c/h2\u003e
      \u003cp\u003eHallo ${patientName},\u003c/p\u003e
      \u003cp\u003eIhre Untersuchung \u003cstrong\u003e"${requirementName}"\u003c/strong\u003e läuft in \u003cstrong\u003e${daysLeft} Tagen\u003c/strong\u003e ab.\u003c/p\u003e
      \u003cp\u003eBitte reichen Sie rechtzeitig eine Erneuerung ein oder vereinbaren Sie einen Termin.\u003c/p\u003e
      \u003cp\u003e\u003ca href="https://nephro-assist-app-pied.vercel.app/dashboard/tasks"\u003eZur Untersuchungsübersicht →\u003c/a\u003e\u003c/p\u003e
      \u003cbr\u003e
      \u003cp\u003eMit freundlichen Grüßen,\u003cbr\u003eIhr NephroAssist-Team\u003c/p\u003e
    `,
  };
}

export function getPatientWelcomeEmail(
  firstName: string,
  email: string,
  password: string,
  clinicName?: string
): { subject: string; html: string; text: string } {
  const loginUrl = "https://nephro-assist-app-pied.vercel.app/login";
  return {
    subject: "🩺 Ihr Zugang zum Patienten-Portal",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Willkommen bei NephroAssist</h2>
        <p>Hallo ${firstName},</p>
        <p>
          ${clinicName ? `Die Klinik <strong>${clinicName}</strong> hat` : "Wir haben"}
          für Sie ein Patienten-Portal-Konto angelegt.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <h3 style="color: #1e40af;">Ihre Zugangsdaten</h3>
        <table style="background: #f8fafc; padding: 16px; border-radius: 8px; width: 100%;">
          <tr>
            <td style="font-weight: bold; padding: 8px 0;">E-Mail:</td>
            <td style="padding: 8px 0;">${email}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px 0;">Passwort:</td>
            <td style="padding: 8px 0; font-family: monospace; font-size: 1.1em;">${password}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="${loginUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Zum Patienten-Portal →
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 0.9em; color: #64748b;">
          <strong>Hinweis:</strong> Bitte ändern Sie Ihr Passwort nach dem ersten Login unter Einstellungen.
        </p>
        <p style="font-size: 0.9em; color: #64748b;">
          Bei Fragen erreichen Sie uns unter <a href="mailto:support@nephroassist.de">support@nephroassist.de</a>.
        </p>
        <br>
        <p>Mit freundlichen Grüßen,<br>Ihr NephroAssist-Team</p>
      </div>
    `,
    text: `Willkommen bei NephroAssist!

Hallo ${firstName},

${clinicName ? `Die Klinik ${clinicName} hat` : "Wir haben"} für Sie ein Patienten-Portal-Konto angelegt.

Ihre Zugangsdaten:
E-Mail: ${email}
Passwort: ${password}

Login: ${loginUrl}

Hinweis: Bitte ändern Sie Ihr Passwort nach dem ersten Login unter Einstellungen.

Mit freundlichen Grüßen,
Ihr NephroAssist-Team`,
  };
}

export function getVerificationEmail(
  firstName: string,
  email: string,
  token: string
): { subject: string; html: string; text: string } {
  const verifyUrl = `${process.env.NEXTAUTH_URL || "https://nephro-assist-app-pied.vercel.app"}/verify-email/${token}`;
  return {
    subject: "E-Mail bestätigen – NephroAssist",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">E-Mail-Adresse bestätigen</h2>
        <p>Hallo ${firstName || email},</p>
        <p>danke für Ihre Registrierung bei NephroAssist. Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren:</p>
        <p style="margin-top: 20px;">
          <a href="${verifyUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            E-Mail bestätigen
          </a>
        </p>
        <p style="margin-top: 20px; font-size: 0.9em; color: #64748b;">
          Oder kopieren Sie diesen Link in Ihren Browser:<br>
          <code style="word-break: break-all;">${verifyUrl}</code>
        </p>
        <p style="font-size: 0.9em; color: #64748b;">
          Dieser Link ist <strong>24 Stunden</strong> gültig. Wenn Sie sich nicht bei NephroAssist registriert haben, können Sie diese E-Mail ignorieren.
        </p>
        <br>
        <p>Mit freundlichen Grüßen,<br>Ihr NephroAssist-Team</p>
      </div>
    `,
    text: `E-Mail-Adresse bestätigen

Hallo ${firstName || email},

danke für Ihre Registrierung bei NephroAssist. Bitte bestätigen Sie Ihre E-Mail-Adresse:

${verifyUrl}

Dieser Link ist 24 Stunden gültig.

Mit freundlichen Grüßen,
Ihr NephroAssist-Team`,
  };
}
