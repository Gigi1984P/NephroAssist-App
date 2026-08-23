/**
 * Clinical Workflow Definitions
 * Pre-transplant clearance workflows for NephroAssist
 */

export interface WorkflowStep {
  stepNumber: number;
  name: string;
  description: string;
  ownerType: "PATIENT" | "CAREGIVER" | "CLINIC" | "EXTERNAL" | "TRANSPLANT_CENTER";
  action: string;
  canUploadDocument: boolean;
  requiresReview: boolean;
}

export interface ClinicalWorkflow {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: WorkflowStep[];
}

/* ================================================================ */
/*  DENTAL CLEARANCE WORKFLOW                                       */
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
      description: "Überweisung/Verordnung beim Hausarzt oder Zahnarzt anfordern",
      ownerType: "PATIENT",
      action: "Verordnung beim Arzt anfordern",
      canUploadDocument: false,
      requiresReview: false,
    },
    {
      stepNumber: 2,
      name: "Verordnung hochladen",
      description: "Die erhaltene Überweisung/Verordnung im Portal hochladen",
      ownerType: "PATIENT",
      action: "Verordnung hochladen",
      canUploadDocument: true,
      requiresReview: false,
    },
    {
      stepNumber: 3,
      name: "Zahnarzttermin vereinbaren",
      description: "Termin beim Zahnarzt vereinbaren (nach Erhalt der Verordnung)",
      ownerType: "PATIENT",
      action: "Zahnarzttermin vereinbaren",
      canUploadDocument: false,
      requiresReview: false,
    },
    {
      stepNumber: 4,
      name: "Termin wahrnehmen",
      description: "Den vereinbarten Zahnarzttermin wahrnehmen",
      ownerType: "PATIENT",
      action: "Termin wahrnehmen",
      canUploadDocument: false,
      requiresReview: false,
    },
    {
      stepNumber: 5,
      name: "Bericht anfordern",
      description: "Zahnarztbericht/Dental Clearance Bericht anfordern",
      ownerType: "PATIENT",
      action: "Bericht vom Zahnarzt anfordern",
      canUploadDocument: false,
      requiresReview: false,
    },
    {
      stepNumber: 6,
      name: "Bericht hochladen",
      description: "Den erhaltenen Zahnarztbericht im Portal hochladen",
      ownerType: "PATIENT",
      action: "Bericht hochladen",
      canUploadDocument: true,
      requiresReview: false,
    },
    {
      stepNumber: 7,
      name: "Prüfung durch Transplantationszentrum",
      description: "Der Bericht wird durch das Transplantationszentrum geprüft",
      ownerType: "TRANSPLANT_CENTER",
      action: "Prüfung abwarten",
      canUploadDocument: false,
      requiresReview: true,
    },
  ],
};

/* ================================================================ */
/*  CARDIAC CLEARANCE WORKFLOW                                      */
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
      ownerType: "PATIENT",
      action: "Verordnung beim Hausarzt anfordern",
      canUploadDocument: false,
      requiresReview: false,
    },
    {
      stepNumber: 2,
      name: "Verordnung hochladen",
      description: "Die erhaltene Überweisung im Portal hochladen",
      ownerType: "PATIENT",
      action: "Verordnung hochladen",
      canUploadDocument: true,
      requiresReview: false,
    },
    {
      stepNumber: 3,
      name: "Kardiologentermin vereinbaren",
      description: "Termin beim Kardiologen vereinbaren",
      ownerType: "PATIENT",
      action: "Termin vereinbaren",
      canUploadDocument: false,
      requiresReview: false,
    },
    {
      stepNumber: 4,
      name: "Untersuchung durchführen",
      description: "EKG, Echokardiografie und weitere Untersuchungen durchführen lassen",
      ownerType: "PATIENT",
      action: "Untersuchung wahrnehmen",
      canUploadDocument: false,
      requiresReview: false,
    },
    {
      stepNumber: 5,
      name: "Bericht anfordern",
      description: "Kardiologie-Bericht anfordern",
      ownerType: "PATIENT",
      action: "Bericht anfordern",
      canUploadDocument: false,
      requiresReview: false,
    },
    {
      stepNumber: 6,
      name: "Bericht hochladen",
      description: "Den erhaltenen Kardiologie-Bericht im Portal hochladen",
      ownerType: "PATIENT",
      action: "Bericht hochladen",
      canUploadDocument: true,
      requiresReview: false,
    },
    {
      stepNumber: 7,
      name: "Prüfung durch Transplantationszentrum",
      description: "Der Bericht wird durch das Transplantationszentrum geprüft",
      ownerType: "TRANSPLANT_CENTER",
      action: "Prüfung abwarten",
      canUploadDocument: false,
      requiresReview: true,
    },
  ],
};

/* ================================================================ */
/*  REGISTRY                                                       */
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
