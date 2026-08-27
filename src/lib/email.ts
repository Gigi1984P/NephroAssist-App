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

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("E-Mail nicht konfiguriert: RESEND_API_KEY fehlt");
    return { success: false, error: "E-Mail-Service nicht konfiguriert" };
  }

  try {
    const from = process.env.EMAIL_FROM || "NephroAssist <noreply@nephroassist.de>";
    await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text || payload.html.replace(/<[^>]*>/g, ""),
    });
    return { success: true };
  } catch (error) {
    console.error("E-Mail-Versand fehlgeschlagen:", error);
    return { success: false, error: String(error) };
  }
}

export function getTaskCompletionEmail(patientName: string, taskName: string): { subject: string; html: string } {
  return {
    subject: `✅ Schritt erledigt: ${taskName}`,
    html: `
      <h2>Schritt erledigt</h2>
      <p>Hallo ${patientName},</p>
      <p>Sie haben den Schritt <strong>"${taskName}"</strong> erfolgreich abgeschlossen.</p>
      <p>Der nächste Schritt steht jetzt zur Verfügung.</p>
      <p><a href="https://nephro-assist-app-pied.vercel.app/dashboard/tasks">Zur Untersuchungsübersicht →</a></p>
      <br>
      <p>Mit freundlichen Grüßen,<br>Ihr NephroAssist-Team</p>
    `,
  };
}

export function getUploadNotificationEmail(patientName: string, documentName: string): { subject: string; html: string } {
  return {
    subject: `📄 Neues Dokument hochgeladen`,
    html: `
      <h2>Neues Dokument hochgeladen</h2>
      <p>Hallo,</p>
      <p>${patientName} hat das Dokument <strong>"${documentName}"</strong> hochgeladen.</p>
      <p>Bitte prüfen Sie das Dokument in der Review-Queue.</p>
      <p><a href="https://nephro-assist-app-pied.vercel.app/dashboard/documents">Zur Dokumenten-Review →</a></p>
      <br>
      <p>Mit freundlichen Grüßen,<br>Ihr NephroAssist-Team</p>
    `,
  };
}

export function getHelpRequestEmail(patientName: string, helpType: string, description: string): { subject: string; html: string } {
  return {
    subject: `🆘 Hilfeanfrage von ${patientName}`,
    html: `
      <h2>Neue Hilfeanfrage</h2>
      <p><strong>Patient:</strong> ${patientName}</p>
      <p><strong>Typ:</strong> ${helpType}</p>
      <p><strong>Beschreibung:</strong></p>
      <blockquote>${description}</blockquote>
      <p><a href="https://nephro-assist-app-pied.vercel.app/dashboard/help-requests">Zur Hilfeanfragen-Übersicht →</a></p>
      <br>
      <p>Mit freundlichen Grüßen,<br>Ihr NephroAssist-Team</p>
    `,
  };
}

export function getExpirationReminderEmail(patientName: string, requirementName: string, daysLeft: number): { subject: string; html: string } {
  return {
    subject: `⏰ Erinnerung: ${requirementName} läuft in ${daysLeft} Tagen ab`,
    html: `
      <h2>Untersuchung läuft bald ab</h2>
      <p>Hallo ${patientName},</p>
      <p>Ihre Untersuchung <strong>"${requirementName}"</strong> läuft in <strong>${daysLeft} Tagen</strong> ab.</p>
      <p>Bitte reichen Sie rechtzeitig eine Erneuerung ein oder vereinbaren Sie einen Termin.</p>
      <p><a href="https://nephro-assist-app-pied.vercel.app/dashboard/tasks">Zur Untersuchungsübersicht →</a></p>
      <br>
      <p>Mit freundlichen Grüßen,<br>Ihr NephroAssist-Team</p>
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
