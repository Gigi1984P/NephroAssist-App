"use client";

import { useState, useEffect } from "react";
import { Stethoscope, CheckCircle } from "lucide-react";
import InlineEditField from "@/components/inline-edit-field";

interface PatientGpData {
  generalPractitionerName: string;
  generalPractitionerCity: string;
  generalPractitionerEmail: string;
  generalPractitionerPhone: string;
  generalPractitionerAddress: string;
}

export default function HausarztInlineCard({ patientId }: { patientId: string }) {
  const [gpData, setGpData] = useState<PatientGpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/edit`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setGpData({
        generalPractitionerName: data.patient.generalPractitionerName || "",
        generalPractitionerCity: data.patient.generalPractitionerCity || "",
        generalPractitionerEmail: data.patient.generalPractitionerEmail || "",
        generalPractitionerPhone: data.patient.generalPractitionerPhone || "",
        generalPractitionerAddress: data.patient.generalPractitionerAddress || "",
      });
    } catch (e) {
      console.error("Load GP error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const handleUpdate = (field: string, value: string) => {
    if (!gpData) return;
    setGpData({ ...gpData, [field]: value } as PatientGpData);
    setSuccess("Gespeichert");
    setTimeout(() => setSuccess(""), 2000);
  };

  if (loading) {
    return (
      <div className="card shadow-sm h-100">
        <div className="card-body text-center py-4">
          <div className="spinner-border spinner-border-sm text-secondary" role="status" />
        </div>
      </div>
    );
  }

  if (!gpData) return null;

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-secondary text-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Stethoscope size={18} /> Hausarzt
        </div>
        {success && (
          <span className="badge bg-success d-inline-flex align-items-center gap-1">
            <CheckCircle size={12} /> {success}
          </span>
        )}
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-sm-6">
            <div className="text-muted small fw-semibold mb-1">Name</div>
            <InlineEditField
              value={gpData.generalPractitionerName}
              label="Name"
              field="generalPractitionerName"
              patientId={patientId}
              placeholder="Dr. Max Mustermann"
              onUpdate={handleUpdate}
            />
          </div>
          <div className="col-sm-6">
            <div className="text-muted small fw-semibold mb-1">Stadt</div>
            <InlineEditField
              value={gpData.generalPractitionerCity}
              label="Stadt"
              field="generalPractitionerCity"
              patientId={patientId}
              placeholder="Berlin"
              onUpdate={handleUpdate}
            />
          </div>
          <div className="col-sm-6">
            <div className="text-muted small fw-semibold mb-1">E-Mail</div>
            <InlineEditField
              value={gpData.generalPractitionerEmail}
              label="E-Mail"
              field="generalPractitionerEmail"
              patientId={patientId}
              type="email"
              placeholder="arzt@beispiel.de"
              onUpdate={handleUpdate}
            />
          </div>
          <div className="col-sm-6">
            <div className="text-muted small fw-semibold mb-1">Telefon</div>
            <InlineEditField
              value={gpData.generalPractitionerPhone}
              label="Telefon"
              field="generalPractitionerPhone"
              patientId={patientId}
              type="tel"
              placeholder="+49 30 123456"
              onUpdate={handleUpdate}
            />
          </div>
          <div className="col-12">
            <div className="text-muted small fw-semibold mb-1">Adresse</div>
            <InlineEditField
              value={gpData.generalPractitionerAddress}
              label="Adresse"
              field="generalPractitionerAddress"
              patientId={patientId}
              placeholder="Musterstraße 1, 10115 Berlin"
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
