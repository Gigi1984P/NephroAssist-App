/**
 * Clinical Workflow Definitions
 * 
 * Jeder Schritt hat einen `actionType`, der definiert wer was tun darf:
 * - "patient_status": Patient markiert Schritt als erledigt (z.B. "Überweisung angefordert")
 * - "patient_upload": Patient lädt Dokument hoch → automatisch erledigt
 * - "clinic_review": Nur Klinik darf erledigen
 */

export interface WorkflowStepDef {
  stepNumber: number;
  name: string;
  description: string;
  actionType: "patient_status" | "patient_upload" | "clinic_review";
  uploadType?: "referral" | "report";
}

export interface ClinicalWorkflow {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: WorkflowStepDef[];
}

/* ================================================================ */
/*  DENTAL CLEARANCE WORKFLOW — 6 Schritte                          */
/* ================================================================ */
export const DENTAL_CLEARANCE_WORKFLOW: ClinicalWorkflow = {
  id: "dental-clearance",
  name: "Dental Clearance",
  category: "Vorbereitung",
  description: "Zahnärztliche Untersuchung und Freigabe für Transplantation",
  steps: [
    {
      stepNumber: 1,
      name: "Überweisung anfordern",
      description: "Verordnung beim Hausarzt oder Zahnarzt anfordern",
      actionType: "patient_status",
    },
    {
      stepNumber: 2,
      name: "Verordnung hochladen",
      description: "Die erhaltene Überweisung/Verordnung im Portal hochladen",
      actionType: "patient_upload",
      uploadType: "referral",
    },
    {
      stepNumber: 3,
      name: "Zahnarzttermin vereinbaren",
      description: "Termin beim Zahnarzt vereinbaren (nach Erhalt der Verordnung)",
      actionType: "patient_status",
    },
    {
      stepNumber: 4,
      name: "Bericht anfordern",
      description: "Zahnarztbericht/Dental Clearance Bericht anfordern",
      actionType: "patient_status",
    },
    {
      stepNumber: 5,
      name: "Bericht hochladen",
      description: "Den erhaltenen Zahnarztbericht im Portal hochladen",
      actionType: "patient_upload",
      uploadType: "report",
    },
    {
      stepNumber: 6,
      name: "Prüfung durch Transplantationszentrum",
      description: "Der Bericht wird durch das Transplantationszentrum geprüft",
      actionType: "clinic_review",
    },
  ],
};

/* ================================================================ */
/*  CARDIAC CLEARANCE WORKFLOW — 6 Schritte                           */
/* ================================================================ */
export const CARDIAC_CLEARANCE_WORKFLOW: ClinicalWorkflow = {
  id: "cardiac-clearance",
  name: "Herz-Kreislauf Clearance",
  category: "Vorbereitung",
  description: "Kardiologische Untersuchung und Freigabe für Transplantation",
  steps: [
    {
      stepNumber: 1,
      name: "Überweisung anfordern",
      description: "Überweisung zum Kardiologen anfordern",
      actionType: "patient_status",
    },
    {
      stepNumber: 2,
      name: "Verordnung hochladen",
      description: "Die erhaltene Überweisung im Portal hochladen",
      actionType: "patient_upload",
      uploadType: "referral",
    },
    {
      stepNumber: 3,
      name: "Kardiologentermin vereinbaren",
      description: "Termin beim Kardiologen vereinbaren",
      actionType: "patient_status",
    },
    {
      stepNumber: 4,
      name: "Bericht anfordern",
      description: "Kardiologie-Bericht anfordern",
      actionType: "patient_status",
    },
    {
      stepNumber: 5,
      name: "Bericht hochladen",
      description: "Den erhaltenen Kardiologie-Bericht im Portal hochladen",
      actionType: "patient_upload",
      uploadType: "report",
    },
    {
      stepNumber: 6,
      name: "Prüfung durch Transplantationszentrum",
      description: "Der Bericht wird durch das Transplantationszentrum geprüft",
      actionType: "clinic_review",
    },
  ],
};

/* ================================================================ */
/*  REGISTRY                                                        */
/* ================================================================ */
export const WORKFLOWS: Record<string, ClinicalWorkflow> = {
  "dental-clearance": DENTAL_CLEARANCE_WORKFLOW,
  "cardiac-clearance": CARDIAC_CLEARANCE_WORKFLOW,
};

export function getWorkflow(id: string): ClinicalWorkflow | undefined {
  return WORKFLOWS[id];
}

export function getAllWorkflows(): ClinicalWorkflow[] {
  return Object.values(WORKFLOWS);
}

/**
 * Prüft ob ein User einen bestimmten Schritt erledigen darf
 */
export function canCompleteStep(
  userRole: string,
  step: WorkflowStepDef
): boolean {
  switch (step.actionType) {
    case "patient_status":
    case "patient_upload":
      return userRole === "PATIENT" || userRole === "CAREGIVER";
    case "clinic_review":
      return [
        "ADMIN",
        "COORDINATOR",
        "PHYSICIAN",
        "NURSE",
        "DIALYSIS_STAFF",
      ].includes(userRole);
    default:
      return false;
  }
}

/**
 * Beschreibung der Aktion für den Nutzer
 */
export function getStepActionLabel(step: WorkflowStepDef): string {
  switch (step.actionType) {
    case "patient_status":
      return "Als erledigt markieren";
    case "patient_upload":
      return "Dokument hochladen";
    case "clinic_review":
      return "Prüfen und bestätigen";
    default:
      return "Erledigen";
  }
}
