"use client";

import { useState, useEffect } from "react";
import { User, CheckCircle } from "lucide-react";
import InlineEditField from "@/components/inline-edit-field";

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  Organization: { name: string } | null;
}

export default function PatientStammdatenCard({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  const loadPatient = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/edit`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setPatient(data.patient);
    } catch (e) {
      console.error("Load patient error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const handleUpdate = (field: string, value: string) => {
    if (!patient) return;
    setPatient({ ...patient, [field]: value } as PatientData);
    setSuccess("Gespeichert");
    setTimeout(() => setSuccess(""), 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch { return "—"; }
  };

  const calculateAge = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return Math.floor((Date.now() - new Date(dateStr).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    } catch { return null; }
  };

  if (loading) {
    return (
      <div className="card mb-4 shadow-sm">
        <div className="card-body text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Laden...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const age = calculateAge(patient.dateOfBirth);

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <User size={18} /> Patientenstammdaten
        </div>
        {success && (
          <span className="badge bg-success d-inline-flex align-items-center gap-1">
            <CheckCircle size={12} /> {success}
          </span>
        )}
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="row mb-2">
              <div className="col-sm-4 text-muted fw-semibold">Vorname</div>
              <div className="col-sm-8">
                <InlineEditField
                  value={patient.firstName}
                  label="Vorname"
                  field="firstName"
                  patientId={patientId}
                  onUpdate={handleUpdate}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-sm-4 text-muted fw-semibold">Nachname</div>
              <div className="col-sm-8">
                <InlineEditField
                  value={patient.lastName}
                  label="Nachname"
                  field="lastName"
                  patientId={patientId}
                  onUpdate={handleUpdate}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-sm-4 text-muted fw-semibold">Geburtsdatum</div>
              <div className="col-sm-8">
                <InlineEditField
                  value={patient.dateOfBirth}
                  label="Geburtsdatum"
                  field="dateOfBirth"
                  patientId={patientId}
                  type="date"
                  onUpdate={handleUpdate}
                  renderDisplay={(v) => (
                    <span>
                      {formatDate(v)} {v && age !== null && `(${age} Jahre)`}
                    </span>
                  )}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-sm-4 text-muted fw-semibold">E-Mail</div>
              <div className="col-sm-8">
                <InlineEditField
                  value={patient.email}
                  label="E-Mail"
                  field="email"
                  patientId={patientId}
                  type="email"
                  onUpdate={handleUpdate}
                />
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-sm-4 text-muted fw-semibold">Telefon</div>
              <div className="col-sm-8">
                <InlineEditField
                  value={patient.phone}
                  label="Telefon"
                  field="phone"
                  patientId={patientId}
                  type="tel"
                  onUpdate={handleUpdate}
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
              <div className="col-sm-8">{formatDate(patient.createdAt)}</div>
            </div>
            <div className="row mb-2">
              <div className="col-sm-4 text-muted fw-semibold">Aktualisiert</div>
              <div className="col-sm-8">{formatDate(patient.updatedAt)}</div>
            </div>
            <div className="row mb-2">
              <div className="col-sm-4 text-muted fw-semibold">Klinik</div>
              <div className="col-sm-8">{patient.Organization?.name || "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
