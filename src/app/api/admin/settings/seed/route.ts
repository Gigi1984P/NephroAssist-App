import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIGS = [
  // EMAIL
  {
    key: "EMAIL_FROM",
    value: process.env.EMAIL_FROM || "onboarding@resend.dev",
    type: "string",
    label: "Absender-E-Mail",
    description: "Die E-Mail-Adresse, von der alle System-Mails versendet werden.",
    category: "email",
  },
  {
    key: "EMAIL_ENABLED",
    value: process.env.RESEND_API_KEY ? "true" : "false",
    type: "boolean",
    label: "E-Mail-Versand aktiv",
    description: "Soll das System automatisch E-Mails versenden?",
    category: "email",
  },
  {
    key: "EMAIL_WELCOME_ENABLED",
    value: "true",
    type: "boolean",
    label: "Willkommens-E-Mail",
    description: "Neue Benutzer erhalten eine Willkommens-E-Mail.",
    category: "email",
  },
  {
    key: "EMAIL_TASK_ENABLED",
    value: "true",
    type: "boolean",
    label: "Task-Benachrichtigungen",
    description: "E-Mail bei neuen Aufgaben und Task-Abschlüssen.",
    category: "email",
  },
  {
    key: "EMAIL_APPOINTMENT_ENABLED",
    value: "true",
    type: "boolean",
    label: "Termin-Erinnerungen",
    description: "E-Mail-Erinnerungen vor Terminen.",
    category: "email",
  },
  {
    key: "EMAIL_FOOTER",
    value: "Diese Nachricht wurde von NephroAssist automatisch generiert.",
    type: "string",
    label: "E-Mail-Footer",
    description: "Text, der am Ende jeder System-E-Mail steht.",
    category: "email",
  },

  // NOTIFICATIONS
  {
    key: "NOTIFY_NEW_PATIENT",
    value: "true",
    type: "boolean",
    label: "Neuer Patient",
    description: "Benachrichtigung, wenn ein neuer Patient angelegt wird.",
    category: "notifications",
  },
  {
    key: "NOTIFY_HELP_REQUEST",
    value: "true",
    type: "boolean",
    label: "Hilfeanfrage",
    description: "Benachrichtigung bei neuen Hilfeanfragen.",
    category: "notifications",
  },
  {
    key: "NOTIFY_DOCUMENT_UPLOAD",
    value: "true",
    type: "boolean",
    label: "Dokumenten-Upload",
    description: "Benachrichtigung, wenn ein Patient ein Dokument hochlädt.",
    category: "notifications",
  },
  {
    key: "NOTIFY_TASK_DUE",
    value: "true",
    type: "boolean",
    label: "Fällige Aufgaben",
    description: "Benachrichtigung, wenn eine Aufgabe demnächst fällig wird.",
    category: "notifications",
  },

  // REMINDERS
  {
    key: "REMINDER_DAYS_BEFORE",
    value: "7",
    type: "number",
    label: "Erinnerung (Tage vorher)",
    description: "Wie viele Tage vor Ablauf einer Untersuchung soll erinnert werden?",
    category: "reminders",
  },
  {
    key: "REMINDER_EXPIRED_ENABLED",
    value: "true",
    type: "boolean",
    label: "Abgelaufene Untersuchungen",
    description: "Erinnerung bei abgelaufenen Untersuchungen.",
    category: "reminders",
  },

  // SECURITY
  {
    key: "PASSWORD_MIN_LENGTH",
    value: "8",
    type: "number",
    label: "Minimale Passwortlänge",
    description: "Mindestanzahl Zeichen für neue Passwörter.",
    category: "security",
  },
  {
    key: "PASSWORD_REQUIRE_SPECIAL",
    value: "false",
    type: "boolean",
    label: "Sonderzeichen erforderlich",
    description: "Passwörter müssen mindestens ein Sonderzeichen enthalten.",
    category: "security",
  },
  {
    key: "SESSION_TIMEOUT_HOURS",
    value: "168",
    type: "number",
    label: "Session-Timeout (Stunden)",
    description: "Nach wie vielen Stunden läuft eine Session ab?",
    category: "security",
  },
  {
    key: "MAX_LOGIN_ATTEMPTS",
    value: "5",
    type: "number",
    label: "Max. Login-Versuche",
    description: "Nach wie vielen fehlgeschlagenen Versuchen wird ein Account vorübergehend gesperrt?",
    category: "security",
  },

  // MAINTENANCE
  {
    key: "MAINTENANCE_MODE",
    value: "false",
    type: "boolean",
    label: "Wartungsmodus",
    description: "Ist der Wartungsmodus aktiv, können nur Administratoren sich anmelden.",
    category: "maintenance",
  },
  {
    key: "MAINTENANCE_MESSAGE",
    value: "Wir führen gerade Wartungsarbeiten durch. Bitte versuchen Sie es später erneut.",
    type: "string",
    label: "Wartungsmeldung",
    description: "Diese Nachricht wird im Wartungsmodus angezeigt.",
    category: "maintenance",
  },

  // GENERAL
  {
    key: "APP_NAME",
    value: "NephroAssist",
    type: "string",
    label: "App-Name",
    description: "Der Name der Anwendung.",
    category: "general",
  },
  {
    key: "ORGANIZATION_NAME",
    value: "Transplantationszentrum",
    type: "string",
    label: "Organisations-Name",
    description: "Name der Klinik oder Organisation.",
    category: "general",
  },
  {
    key: "TIMEZONE",
    value: "Europe/Berlin",
    type: "string",
    label: "Zeitzone",
    description: "Zeitzone für Termine und Zeitstempel.",
    category: "general",
  },
];

export async function POST() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const results = [];
    for (const cfg of DEFAULT_CONFIGS) {
      const existing = await prisma.systemConfig.findUnique({
        where: { key: cfg.key },
      });
      if (!existing) {
        const created = await prisma.systemConfig.create({ data: cfg });
        results.push({ key: cfg.key, status: "created", value: created.value });
      } else {
        results.push({ key: cfg.key, status: "exists", value: existing.value });
      }
    }

    return NextResponse.json({
      message: "Default-Einstellungen initialisiert",
      results,
    });
  } catch (error) {
    console.error("Seed config error:", error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
