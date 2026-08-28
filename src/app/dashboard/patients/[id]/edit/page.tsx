"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { useTranslation } from "@/components/i18n-provider";
import { ArrowLeft, Save, User, Calendar, Mail, Phone, Stethoscope, Building2, Clock, Activity } from "lucide-react";

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
  consentStatus: string;
  organizationId: string | null;
  generalPractitionerName: string;
  generalPractitionerEmail: string;
  generalPractitionerPhone: string;
  generalPractitionerAddress: string;
  generalPractitionerCity: string;
  waitlistedDate: string;
  transplantType: string;
  createdAt: string;
  updatedAt: string;
}

interface Organization {
  id: string;
  name: string;
}

interface TransplantProgram {
  id: string;
  name: string;
  type: string;
}

export default function PatientEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [id, setId] = useState("");
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [programs, setPrograms] = useState<TransplantProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    language: "de",
    timezone: "Europe/Berlin",
    consentStatus: "CONSENT_PENDING",
    organizationId: "",
    generalPractitionerName: "",
    generalPractitionerEmail: "",
    generalPractitionerPhone: "",
    generalPractitionerAddress: "",
    generalPractitionerCity: "",
    waitlistedDate: "",
    transplantType: "",
  });

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/patients/${id}/edit`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) {
          setError(t("patient.notFound", "Patient nicht gefunden"));
        } else {
          setError(t("error.generic", "Fehler beim Laden der Daten"));
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPatient(data.patient);
      setOrganizations(data.organizations || []);
      setPrograms(data.programs || []);
      setForm({
        firstName: data.patient.firstName || "",
        lastName: data.patient.lastName || "",
        dateOfBirth: data.patient.dateOfBirth || "",
        email: data.patient.email || "",
        phone: data.patient.phone || "",
        language: data.patient.language || "de",
        timezone: data.patient.timezone || "Europe/Berlin",
        consentStatus: data.patient.consentStatus || "CONSENT_PENDING",
        organizationId: data.patient.organizationId || "",
        generalPractitionerName: data.patient.generalPractitionerName || "",
        generalPractitionerEmail: data.patient.generalPractitionerEmail || "",
        generalPractitionerPhone: data.patient.generalPractitionerPhone || "",
        generalPractitionerAddress: data.patient.generalPractitionerAddress || "",
        generalPractitionerCity: data.patient.generalPractitionerCity || "",
        waitlistedDate: data.patient.waitlistedDate || "",
        transplantType: data.patient.transplantType || "",
      });
    } catch (e) {
      setError(t("error.network", "Netzwerkfehler beim Laden"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/patients/${id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t("error.generic", "Fehler beim Speichern"));
      } else {
        setSuccess(t("success.updated", "Patient erfolgreich aktualisiert"));
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e) {
      setError(t("error.network", "Netzwerkfehler beim Speichern"));
    } finally {
      setSaving(false);
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

  if (error && !patient) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">{error}</div>
        <Link href="/dashboard/patients" className="btn btn-secondary">
          <ArrowLeft size={16} /> Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <PageHeader title={`${form.firstName} ${form.lastName} bearbeiten`} />

      <div className="mb-3">
        <Link href={`/dashboard/patients/${id}/clinic`} className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
          <ArrowLeft size={14} /> Zurück zur Detailseite
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Persönliche Daten */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white d-flex align-items-center gap-2">
            <User size={18} /> Persönliche Daten
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">Vorname *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Nachname *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Geburtsdatum *</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Sprache</label>
                <select
                  className="form-select"
                  value={form.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                >
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                  <option value="ar">العربية</option>
                  <option value="it">Italiano</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Kontaktdaten */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-info text-white d-flex align-items-center gap-2">
            <Mail size={18} /> Kontaktdaten
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">E-Mail</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder={t("patient.email", "patient@beispiel.de")}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Telefon</label>
                <input
                  type="tel"
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder={t("patient.phone", "+49 170 1234567")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Klinik & Transplantation */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-success text-white d-flex align-items-center gap-2">
            <Building2 size={18} /> Klinik & Transplantation
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">Organisation</label>
                <select
                  className="form-select"
                  value={form.organizationId}
                  onChange={(e) => handleChange("organizationId", e.target.value)}
                >
                  <option value="">-- Keine --</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Einwilligungsstatus</label>
                <select
                  className="form-select"
                  value={form.consentStatus}
                  onChange={(e) => handleChange("consentStatus", e.target.value)}
                >
                  <option value="CONSENT_PENDING">Ausstehend</option>
                  <option value="CONSENT_GRANTED">Erteilt</option>
                  <option value="CONSENT_REVOKED">Widerrufen</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Transplantationstyp</label>
                <select
                  className="form-select"
                  value={form.transplantType}
                  onChange={(e) => handleChange("transplantType", e.target.value)}
                >
                  <option value="">-- Keiner --</option>
                  <option value="kidney">Niere</option>
                  <option value="liver">Leber</option>
                  <option value="heart">Herz</option>
                  <option value="lung">Lunge</option>
                  <option value="pancreas">Bauchspeicheldrüse</option>
                  <option value="combined">Kombiniert</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Auf Warteliste seit</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.waitlistedDate}
                  onChange={(e) => handleChange("waitlistedDate", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hausarzt */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-secondary text-white d-flex align-items-center gap-2">
            <Stethoscope size={18} /> Hausarzt
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.generalPractitionerName}
                  onChange={(e) => handleChange("generalPractitionerName", e.target.value)}
                  placeholder=t("patient.gpName", "Dr. Max Mustermann")
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Stadt</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.generalPractitionerCity}
                  onChange={(e) => handleChange("generalPractitionerCity", e.target.value)}
                  placeholder=t("common.city", "Berlin")
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">E-Mail</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.generalPractitionerEmail}
                  onChange={(e) => handleChange("generalPractitionerEmail", e.target.value)}
                  placeholder=t("patient.gpEmail", "arzt@beispiel.de")
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Telefon</label>
                <input
                  type="tel"
                  className="form-control"
                  value={form.generalPractitionerPhone}
                  onChange={(e) => handleChange("generalPractitionerPhone", e.target.value)}
                  placeholder=t("patient.gpPhone", "+49 30 123456")
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-medium">Adresse</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.generalPractitionerAddress}
                  onChange={(e) => handleChange("generalPractitionerAddress", e.target.value)}
                  placeholder=t("patient.gpAddress", "Musterstraße 1, 10115 Berlin")
                />
              </div>
            </div>
          </div>
        </div>

        {/* Speichern */}
        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary d-inline-flex align-items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Speichern...
              </>
            ) : (
              <>
                <Save size={18} />
                Speichern
              </>
            )}
          </button>
          <Link
            href={`/dashboard/patients/${id}/clinic`}
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
          >
            <ArrowLeft size={18} />
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}
