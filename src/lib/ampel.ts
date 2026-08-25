/**
 * Ampel-System für PatientRequirement-Status
 * GRÜN = Alles ok, GELB = Bald fällig, ROT = Abgelaufen/Blockiert
 */

export type AmpelColor = "green" | "yellow" | "red";

interface AmpelInput {
  status: string;
  expiresAt: Date | null;
  renewalLeadTime?: number | null;
}

export function getAmpelColor(req: AmpelInput): AmpelColor {
  const now = new Date();

  // Rot: Abgelaufen, Blockiert, Abgelehnt, Erneuerung fällig
  if (
    req.status === "EXPIRED" ||
    req.status === "RENEWAL_REQUIRED" ||
    req.status === "BLOCKED" ||
    req.status === "REJECTED"
  ) {
    return "red";
  }

  // Gelb: Läuft bald ab (innerhalb renewalLeadTime Monate)
  if (req.expiresAt) {
  const leadTimeMonths = req.renewalLeadTime || 2; // Default 2 Monate statt 60 Tage
  const leadTimeMs = leadTimeMonths * 30 * 24 * 60 * 60 * 1000;
    const warningDate = new Date(req.expiresAt.getTime() - leadTimeMs);
    if (now >= warningDate && now < req.expiresAt) {
      return "yellow";
    }
    if (now >= req.expiresAt) {
      return "red";
    }
  }

  // Grün: Alles ok
  return "green";
}

export function getAmpelLabel(color: AmpelColor): string {
  switch (color) {
    case "green":
      return "Gültig";
    case "yellow":
      return "Bald fällig";
    case "red":
      return "Abgelaufen / Blockiert";
  }
}

export function getAmpelBadgeClass(color: AmpelColor): string {
  switch (color) {
    case "green":
      return "badge-green";
    case "yellow":
      return "badge-yellow";
    case "red":
      return "badge-red";
  }
}

export function getAmpelDotStyle(color: AmpelColor): React.CSSProperties {
  switch (color) {
    case "green":
      return { width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" };
    case "yellow":
      return { width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f59e0b", display: "inline-block" };
    case "red":
      return { width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" };
  }
}
