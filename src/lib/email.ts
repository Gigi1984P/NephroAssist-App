import { Resend } from "resend";

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

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string; logged?: boolean; resultId?: string }> {
  // ── Fallback: Wenn Resend nicht konfiguriert, logge die E-Mail ──
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
    // WICHTIG: Resend erfordert eine verifizierte Domain.
    // Ohne Verifizierung muss man onboarding@resend.dev als Absender verwenden.
    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const result = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text || payload.html.replace(/\u003c[^\u003e]*\u003e/g, ""),
    });
    console.log("✅ E-Mail gesendet:", (result as any)?.id || "OK");
    return { success: true, resultId: (result as any)?.id };
  } catch (error) {
    console.error("E-Mail-Versand fehlgeschlagen:", error);
    return { success: false, error: String(error) };
  }
}

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
      \u003cdiv style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"\u003e
        \u003ch2 style="color: #3b82f6;"\u003eWillkommen bei NephroAssist\u003c/h2\u003e
        \u003cp\u003eHallo ${firstName},\u003c/p\u003e
        \u003cp\u003e
          ${clinicName ? `Die Klinik \u003cstrong\u003e${clinicName}\u003c/strong\u003e hat` : "Wir haben"}
          für Sie ein Patienten-Portal-Konto angelegt.
        \u003c/p\u003e
        \u003chr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" /\u003e
        \u003ch3 style="color: #1e40af;"\u003eIhre Zugangsdaten\u003c/h3\u003e
        \u003ctable style="background: #f8fafc; padding: 16px; border-radius: 8px; width: 100%;"\u003e
          \u003ctr\u003e
            \u003ctd style="font-weight: bold; padding: 8px 0;"\u003eE-Mail:\u003c/td\u003e
            \u003ctd style="padding: 8px 0;"\u003e${email}\u003c/td\u003e
          \u003c/tr\u003e
          \u003ctr\u003e
            \u003ctd style="font-weight: bold; padding: 8px 0;"\u003ePasswort:\u003c/td\u003e
            \u003ctd style="padding: 8px 0; font-family: monospace; font-size: 1.1em;"\u003e${password}\u003c/td\u003e
          \u003c/tr\u003e
        \u003c/table\u003e
        \u003cp style="margin-top: 20px;"\u003e
          \u003ca href="${loginUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;"\u003e
            Zum Patienten-Portal →
          \u003c/a\u003e
        \u003c/p\u003e
        \u003chr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" /\u003e
        \u003cp style="font-size: 0.9em; color: #64748b;"\u003e
          \u003cstrong\u003eHinweis:\u003c/strong\u003e Bitte ändern Sie Ihr Passwort nach dem ersten Login unter Einstellungen.
        \u003c/p\u003e
        \u003cp style="font-size: 0.9em; color: #64748b;"\u003e
          Bei Fragen erreichen Sie uns unter \u003ca href="mailto:support@nephroassist.de"\u003esupport@nephroassist.de\u003c/a\u003e.
        \u003c/p\u003e
        \u003cbr\u003e
        \u003cp\u003eMit freundlichen Grüßen,\u003cbr\u003eIhr NephroAssist-Team\u003c/p\u003e
      \u003c/div\u003e
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
