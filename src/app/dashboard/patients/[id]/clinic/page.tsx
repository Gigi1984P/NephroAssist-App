"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import MedicationPlan from "@/components/medication-plan";
import InlineAssignRequirement from "@/components/inline-assign-requirement";
import PatientRequirementsTable from "@/components/patient-requirements-table";
import AssignTemplateSet from "@/components/assign-template-set";
import DialysisRegime from "@/components/dialysis-regime";
import InlineEditField from "@/components/inline-edit-field";
import InlineEditSelect from "@/components/inline-edit-select";
import InlineEditTextarea from "@/components/inline-edit-textarea";
import {
  ArrowLeft, Calendar, User, Stethoscope, ClipboardList, Clock, Phone, Mail,
  AlertTriangle, CheckCircle, XCircle, AlertCircle, FileText, Bell, MessageCircle,
  ChevronRight, Activity, Circle, Pencil, Trash2, FileUp, Save, Check,
} from "lucide-react";
import ReadinessScoreBadge from "@/components/readiness-score-badge";
import LabValueTrend from "@/components/lab-value-trend";
import PatientOnboardingChecklist from "@/components/patient-onboarding-checklist";
import PatientCommentBox from "@/components/patient-comment-box";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

function formatDate(dateStr: string | null | Date): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return "—"; }
}

function formatDateTime(dateStr: string | null | Date): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}

function calcAge(dateStr: string | null): number | null {
  if (!dateStr) return null;
  try {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  } catch { return null; }
}

function getCaseStatusBadge(status: string | null) {
  const s = (status || "").toUpperCase();
  if (s === "ACTIVE") return { text: "Aktiv", variant: "success" };
  if (s === "ON_HOLD") return { text: "Pausiert", variant: "warning" };
  if (s === "CLOSED") return { text: "Abgeschlossen", variant: "secondary" };
  if (s === "ARCHIVED") return { text: "Archiviert", variant: "dark" };
  return { text: status || "—", variant: "secondary" };
}

export default function PatientClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [patient, setPatient] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      loadAllData(p.id);
    });
  }, [params]);

  const showSaveMsg = () => {
    setSaveMsg("Gespeichert");
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const handlePatientUpdate = (field: string, value: string) => {
    if (!patient) return;
    setPatient({ ...patient, [field]: value });
    showSaveMsg();
  };

  const loadAllData = async (patientId: string) => {
    setLoading(true);
    setError("");

    try {
      // Load patient
      const patientRes = await fetch(`/api/patients/${patientId}/edit`, { credentials: "include" });
      if (patientRes.status === 401 || patientRes.status === 403) {
        router.push("/dashboard");
        return;
      }
      if (!patientRes.ok) {
        if (patientRes.status === 404) setError("Patient nicht gefunden");
        else setError("Fehler beim Laden");
        setLoading(false);
        return;
      }
      const patientData = await patientRes.json();
      setPatient(patientData.patient);
      setOrganizations(patientData.organizations || []);

      // Load overview for coordinators
      const overviewRes = await fetch("/api/patients/overview", { credentials: "include" });
      if (overviewRes.ok) {
        const overview = await overviewRes.json();
        setCoordinators(overview.coordinators || []);
      }

      // Load other data
      await Promise.all([
        (async () => {
          try {
            const res = await fetch(`/api/patients/${patientId}/documents`, { credentials: "include" });
            if (res.ok) { const d = await res.json(); setDocuments(d.documents || []); }
          } catch (e) {}
        })(),
        (async () => {
          try {
            const res = await fetch(`/api/patients/${patientId}/appointments`, { credentials: "include" });
            if (res.ok) { const d = await res.json(); setAppointments(d.appointments || []); }
          } catch (e) {}
        })(),
        (async () => {
          try {
            const res = await fetch(`/api/patients/${patientId}/requirements`, { credentials: "include" });
            if (res.ok) { const d = await res.json(); setRequirements(d.requirements || []); }
          } catch (e) {}
        })(),
        (async () => {
          try {
            const res = await fetch(`/api/patients/${patientId}/medications`, { credentials: "include" });
            if (res.ok) { const d = await res.json(); setMedications(d.medications || []); }
          } catch (e) {}
        })(),
      ]);
    } catch (e) {
      setError("Netzwerkfehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
        <p className="text-muted mt-2">Patientendaten werden geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">{error}</div>
        <Link href="/dashboard/patients" className="btn btn-secondary">
          <ArrowLeft size={16} /> Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  if (!patient) return null;

  const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Unbekannt";
  const age = calcAge(patient.dateOfBirth);
  const latestCase = patient.cases?.[0] || null;
  const coordinator = coordinators.find((c: any) => c.id === latestCase?.coordinatorId);

  const consentOptions = [
    { value: "CONSENT_PENDING", label: "Ausstehend" },
    { value: "CONSENT_GRANTED", label: "Erteilt" },
    { value: "CONSENT_REVOKED", label: "Widerrufen" },
  ];

  const transplantOptions = [
    { value: "", label: "— Keiner —" },
    { value: "kidney", label: "Niere" },
    { value: "liver", label: "Leber" },
    { value: "heart", label: "Herz" },
    { value: "lung", label: "Lunge" },
    { value: "pancreas", label: "Bauchspeicheldrüse" },
    { value: "combined", label: "Kombiniert" },
  ];

  const languageOptions = [
    { value: "de", label: "Deutsch" },
    { value: "en", label: "English" },
    { value: "tr", label: "Türkçe" },
    { value: "ar", label: "العربية" },
    { value: "it", label: "Italiano" },
  ];

  const orgOptions = [
    { value: "", label: "— Keine —" },
    ...organizations.map((o: any) => ({ value: o.id, label: o.name })),
  ];

  return (
    <div className="p-4">
      <PageHeader title={fullName} />

      <div className="mb-3 d-flex align-items-center gap-2">
        <Link href="/dashboard/patients" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
          <ArrowLeft size={14} /> Zurück zur Übersicht
        </Link>
        {saveMsg && (
          <span className="badge bg-success d-inline-flex align-items-center gap-1">
            <Check size={12} /> {saveMsg}
          </span>
        )}
      </div>

      {/* STAMMDATEN - ALLE FELDER INLINE */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white d-flex align-items-center gap-2">
          <User size={18} /> Patientenstammdaten
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Vorname *</div>
                <div className="col-sm-8">
                  <InlineEditField value={patient.firstName} label="Vorname" field="firstName" patientId={id} onUpdate={handlePatientUpdate} />
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Nachname *</div>
                <div className="col-sm-8">
                  <InlineEditField value={patient.lastName} label="Nachname" field="lastName" patientId={id} onUpdate={handlePatientUpdate} />
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Geburtsdatum *</div>
                <div className="col-sm-8">
                  <InlineEditField
                    value={patient.dateOfBirth}
                    label="Geburtsdatum"
                    field="dateOfBirth"
                    patientId={id}
                    type="date"
                    onUpdate={handlePatientUpdate}
                    renderDisplay={(v) => <span>{formatDate(v)} {v && age !== null && `(${age} Jahre)`}</span>}
                  />
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">E-Mail</div>
                <div className="col-sm-8">
                  <InlineEditField value={patient.email || ""} label="E-Mail" field="email" patientId={id} type="email" onUpdate={handlePatientUpdate} />
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Telefon</div>
                <div className="col-sm-8">
                  <InlineEditField value={patient.phone || ""} label="Telefon" field="phone" patientId={id} type="tel" onUpdate={handlePatientUpdate} />
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Sprache</div>
                <div className="col-sm-8">
                  <InlineEditSelect
                    value={patient.language || "de"}
                    label="Sprache"
                    field="language"
                    patientId={id}
                    options={languageOptions}
                    onUpdate={handlePatientUpdate}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Patient-ID</div>
                <div className="col-sm-8">
                  <code className="text-muted">{patient.id.substring(0, 8)}...</code>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Erstellt</div>
                <div className="col-sm-8">{formatDateTime(patient.createdAt)}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Aktualisiert</div>
                <div className="col-sm-8">{formatDateTime(patient.updatedAt)}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Organisation</div>
                <div className="col-sm-8">
                  <InlineEditSelect
                    value={patient.organizationId || ""}
                    label="Organisation"
                    field="organizationId"
                    patientId={id}
                    options={orgOptions}
                    onUpdate={handlePatientUpdate}
                    renderDisplay={(v) => {
                      const org = organizations.find((o: any) => o.id === v);
                      return <span>{org?.name || "—"}</span>;
                    }}
                  />
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Einwilligung</div>
                <div className="col-sm-8">
                  <InlineEditSelect
                    value={patient.consentStatus || "CONSENT_PENDING"}
                    label="Einwilligung"
                    field="consentStatus"
                    patientId={id}
                    options={consentOptions}
                    onUpdate={handlePatientUpdate}
                  />
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Readiness</div>
                <div className="col-sm-8">
                  <ReadinessScoreBadge patientId={id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* READINESS + LABORWERTE */}
      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex align-items-center gap-2" style={{ background: "#f0fdf4", color: "#166534" }}>
              <Activity size={18} /> Transplantations-Readiness
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Basierend auf abgeschlossenen Untersuchungen
                </span>
                <a href={`/dashboard/patients/${id}/clinic`} className="btn btn-sm btn-outline-success">
                  Neu berechnen
                </a>
              </div>
              <ReadinessScoreBadge patientId={id} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex align-items-center gap-2" style={{ background: "#eff6ff", color: "#1e40af" }}>
              <Activity size={18} /> Laborwerte
            </div>
            <div className="card-body">
              <LabValueTrend patientId={id} />
            </div>
          </div>
        </div>
      </div>

      {/* AKTUELLER FALL + HAUSARZT - ALLE INLINE */}
      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-info text-white d-flex align-items-center gap-2">
              <ClipboardList size={18} /> Aktueller Fall
            </div>
            <div className="card-body">
              {latestCase ? (
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Status</div>
                    <span className={`badge bg-${getCaseStatusBadge(latestCase.status).variant === "success" ? "success" : getCaseStatusBadge(latestCase.status).variant === "warning" ? "warning text-dark" : getCaseStatusBadge(latestCase.status).variant === "secondary" ? "secondary" : "dark"}`}>
                      {getCaseStatusBadge(latestCase.status).text}
                    </span>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Programm</div>
                    <div>{latestCase.program?.name || "—"}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Koordinator</div>
                    <div>{coordinator?.name || "—"}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Fall erstellt</div>
                    <div>{formatDateTime(latestCase.createdAt)}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Einweisung</div>
                    <div>{formatDate(latestCase.referralDate)}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Aufnahme</div>
                    <div>{formatDate(latestCase.intakeDate)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-3">Kein aktiver Fall vorhanden</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-secondary text-white d-flex align-items-center gap-2">
              <Stethoscope size={18} /> Hausarzt
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="text-muted small fw-semibold mb-1">Name</div>
                  <InlineEditField
                    value={patient.generalPractitionerName || ""}
                    label="Name"
                    field="generalPractitionerName"
                    patientId={id}
                    placeholder="Dr. Max Mustermann"
                    onUpdate={handlePatientUpdate}
                  />
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small fw-semibold mb-1">Stadt</div>
                  <InlineEditField
                    value={patient.generalPractitionerCity || ""}
                    label="Stadt"
                    field="generalPractitionerCity"
                    patientId={id}
                    placeholder="Berlin"
                    onUpdate={handlePatientUpdate}
                  />
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small fw-semibold mb-1">E-Mail</div>
                  <InlineEditField
                    value={patient.generalPractitionerEmail || ""}
                    label="E-Mail"
                    field="generalPractitionerEmail"
                    patientId={id}
                    type="email"
                    placeholder="arzt@beispiel.de"
                    onUpdate={handlePatientUpdate}
                  />
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small fw-semibold mb-1">Telefon</div>
                  <InlineEditField
                    value={patient.generalPractitionerPhone || ""}
                    label="Telefon"
                    field="generalPractitionerPhone"
                    patientId={id}
                    type="tel"
                    placeholder="+49 30 123456"
                    onUpdate={handlePatientUpdate}
                  />
                </div>
                <div className="col-12">
                  <div className="text-muted small fw-semibold mb-1">Adresse</div>
                  <InlineEditTextarea
                    value={patient.generalPractitionerAddress || ""}
                    label="Adresse"
                    field="generalPractitionerAddress"
                    patientId={id}
                    placeholder="Musterstraße 1, 10115 Berlin"
                    rows={2}
                    onUpdate={handlePatientUpdate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSPLANTATION - INLINE */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-success text-white d-flex align-items-center gap-2">
          <Activity size={18} /> Transplantation
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Typ</div>
                <div className="col-sm-8">
                  <InlineEditSelect
                    value={patient.transplantType || ""}
                    label="Transplantationstyp"
                    field="transplantType"
                    patientId={id}
                    options={transplantOptions}
                    onUpdate={handlePatientUpdate}
                  />
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Warteliste seit</div>
                <div className="col-sm-8">
                  <InlineEditField
                    value={patient.waitlistedDate || ""}
                    label="Warteliste seit"
                    field="waitlistedDate"
                    patientId={id}
                    type="date"
                    onUpdate={handlePatientUpdate}
                    renderDisplay={(v) => <span>{formatDate(v)}</span>}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Readiness-Score</div>
                <div className="col-sm-8">
                  <ReadinessScoreBadge patientId={id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MEDIKAMENTENPLAN */}
      <MedicationPlan patientId={id} initialMedications={medications} />

      {/* DIALYSEREGIME */}
      <DialysisRegime patientId={id} />

      {/* OFFENE UNTERSUCHUNGEN */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-warning text-dark d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <ClipboardList size={18} /> Offene Untersuchungen ({requirements.length})
          </div>
        </div>
        <div className="card-body p-3">
          <AssignTemplateSet patientId={id} />
          <InlineAssignRequirement patientId={id} />
          <PatientRequirementsTable patientId={id} requirements={requirements as any} />
        </div>
      </div>

      {/* DOKUMENTE */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-success text-white d-flex align-items-center gap-2">
          <FileText size={18} /> Eingereichte Dokumente ({documents.length})
        </div>
        <div className="card-body p-0">
          {documents.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Datei</th>
                    <th>Typ</th>
                    <th>Status</th>
                    <th>Hochgeladen</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.filename}</td>
                      <td>{doc.documentType || "—"}</td>
                      <td>
                        <span className="badge bg-secondary">{doc.processingStatus || "—"}</span>
                      </td>
                      <td>{formatDateTime(doc.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <FileUp size={32} className="mb-2" />
              <div>Noch keine Dokumente eingereicht</div>
            </div>
          )}
        </div>
      </div>

      {/* TERMINE */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-info text-white d-flex align-items-center gap-2">
          <Calendar size={18} /> Termine ({appointments.length})
        </div>
        <div className="card-body p-0">
          {appointments.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Typ</th>
                    <th>Datum</th>
                    <th>Ort</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{appt.type}</td>
                      <td>{formatDateTime(appt.startTime)}</td>
                      <td>{appt.location || "—"}</td>
                      <td>
                        <span className="badge bg-secondary">{appt.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <Calendar size={32} className="mb-2" />
              <div>Keine Termine vorhanden</div>
            </div>
          )}
        </div>
      </div>

      {/* ONBOARDING + KOMMENTARE */}
      <div className="row mb-4">
        <div className="col-lg-6">
          <PatientOnboardingChecklist patientId={id} />
        </div>
        <div className="col-lg-6">
          <PatientCommentBox patientId={id} />
        </div>
      </div>

      {/* AKTIONEN */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white d-flex align-items-center gap-2">
          <Pencil size={18} /> Aktionen
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">
            <Link href={`/dashboard/patients/${id}/edit`} className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1">
              <Pencil size={14} /> Vollständig bearbeiten
            </Link>
            <Link href={`/dashboard/patients/${id}/documents/upload`} className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1">
              <FileUp size={14} /> Dokument hochladen
            </Link>
            <Link href={`/dashboard/patients/${id}/appointments/new`} className="btn btn-outline-info btn-sm d-inline-flex align-items-center gap-1">
              <Calendar size={14} /> Termin vereinbaren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
