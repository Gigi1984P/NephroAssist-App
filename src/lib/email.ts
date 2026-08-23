import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn("Resend API key not configured. Email not sent.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "NephroAssist <noreply@nephroassist.de>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send exception:", error);
    return { success: false, error: "Email send failed" };
  }
}

export async function sendTaskNotification(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      requirement: {
        include: {
          patientCase: {
            include: {
              patient: true,
            },
          },
        },
      },
    },
  });

  if (!task || !task.requirement?.patientCase?.patient?.email) {
    return { success: false, error: "Task or patient email not found" };
  }

  const patient = task.requirement.patientCase.patient;
  const patientEmail = patient.email;
  const patientName = patient.firstName;

  if (!patientEmail || !patientName) {
    return { success: false, error: "Patient email or name not found" };
  }

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Kein Fälligkeitsdatum";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NephroAssist</h1>
          </div>
          <div class="content">
            <h2>Neue Untersuchung: ${task.title}</h2>
            <p>Hallo ${patient.firstName},</p>
            <p>Sie haben eine neue Untersuchung in Ihrem NephroAssist-Portal:</p>
            <ul>
              <li><strong>Untersuchung:</strong> ${task.title}</li>
              <li><strong>Beschreibung:</strong> ${task.description || "Keine Beschreibung"}</li>
              <li><strong>Fällig bis:</strong> ${dueDate}</li>
            </ul>
            <p>Bitte loggen Sie sich ein, um die Untersuchung zu bearbeiten.</p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard/tasks/${task.id}" class="button">
              Untersuchung anzeigen
            </a>
            <div class="footer">
              <p>Dies ist eine automatische Nachricht von NephroAssist.</p>
              <p>Bitte antworten Sie nicht auf diese E-Mail.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: patientEmail,
    subject: `NephroAssist: Neue Untersuchung - ${task.title}`,
    html,
  });
}

export async function sendAppointmentReminder(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
    },
  });

  if (!appointment || !appointment.patient.email) {
    return { success: false, error: "Appointment or patient email not found" };
  }

  const patient = appointment.patient;
  const patientEmail = patient.email;
  const patientName = patient.firstName;

  if (!patientEmail || !patientName) {
    return { success: false, error: "Patient email or name not found" };
  }

  const appointmentDate = new Date(appointment.startTime).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NephroAssist</h1>
          </div>
          <div class="content">
            <h2>Terminerinnerung: ${appointment.type}</h2>
            <p>Hallo ${patient.firstName},</p>
            <p>dies ist eine Erinnerung an Ihren bevorstehenden Termin:</p>
            <ul>
              <li><strong>Art:</strong> ${appointment.type}</li>
              <li><strong>Wann:</strong> ${appointmentDate}</li>
              <li><strong>Ort:</strong> ${appointment.location || "Wird noch bekannt gegeben"}</li>
              <li><strong>Arzt:</strong> ${appointment.provider || "Wird noch bekannt gegeben"}</li>
            </ul>
            <p>Bitte erscheinen Sie pünktlich zu Ihrem Termin.</p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard/appointments" class="button">
              Termin anzeigen
            </a>
            <div class="footer">
              <p>Dies ist eine automatische Nachricht von NephroAssist.</p>
              <p>Bitte antworten Sie nicht auf diese E-Mail.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: patientEmail,
    subject: `NephroAssist: Terminerinnerung - ${appointment.type}`,
    html,
  });
}

export async function sendDocumentUploadedNotification(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      patient: true,
    },
  });

  if (!document || !document.patient.email) {
    return { success: false, error: "Document or patient email not found" };
  }

  const patient = document.patient;
  const patientEmail = patient.email;
  const patientName = patient.firstName;

  if (!patientEmail || !patientName) {
    return { success: false, error: "Patient email or name not found" };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NephroAssist</h1>
          </div>
          <div class="content">
            <h2>Dokument hochgeladen</h2>
            <p>Hallo ${patient.firstName},</p>
            <p>Ihr Dokument wurde erfolgreich hochgeladen und wird nun überprüft:</p>
            <ul>
              <li><strong>Dateiname:</strong> ${document.filename}</li>
              <li><strong>Typ:</strong> ${document.documentType || "Dokument"}</li>
              <li><strong>Upload-Datum:</strong> ${new Date(document.createdAt).toLocaleDateString("de-DE")}</li>
            </ul>
            <p>Sie erhalten eine Benachrichtigung, sobald die Prüfung abgeschlossen ist.</p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard/documents" class="button">
              Dokumente anzeigen
            </a>
            <div class="footer">
              <p>Dies ist eine automatische Nachricht von NephroAssist.</p>
              <p>Bitte antworten Sie nicht auf diese E-Mail.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: patientEmail,
    subject: `NephroAssist: Dokument hochgeladen - ${document.filename}`,
    html,
  });
}

export async function sendStatusChangeNotification(
  entityType: string,
  entityId: string,
  newStatus: string,
  recipientEmail: string,
  recipientName: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NephroAssist</h1>
          </div>
          <div class="content">
            <h2>Statusänderung</h2>
            <p>Hallo ${recipientName},</p>
            <p>Der Status von <strong>${entityType}</strong> wurde geändert:</p>
            <ul>
              <li><strong>Entität:</strong> ${entityType}</li>
              <li><strong>Neuer Status:</strong> ${newStatus}</li>
            </ul>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">
              Zur Übersicht
            </a>
            <div class="footer">
              <p>Dies ist eine automatische Nachricht von NephroAssist.</p>
              <p>Bitte antworten Sie nicht auf diese E-Mail.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `NephroAssist: Statusänderung - ${entityType}`,
    html,
  });
}
