"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Shield, CheckCircle, AlertTriangle, Clock, FileText } from "lucide-react";

interface PassportData {
  patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    phone: string;
  };
  case: {
    programName: string;
    programType: string;
    status: string;
    referralDate: string;
    waitlistedDate: string;
  };
  requirements: Array<{
    title: string;
    category: string;
    status: string;
    completedAt: string | null;
    expiresAt: string | null;
  }>;
  documents: Array<{
    filename: string;
    documentType: string;
    processingStatus: string;
    createdAt: string;
  }>;
}

export default function PassportPage() {
  const params = useParams();
  const token = params?.token as string;

  const [data, setData] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchPassport();
  }, [token]);

  async function fetchPassport() {
    try {
      setLoading(true);
      const res = await fetch(`/api/passport/${token}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ungültiger oder abgelaufener Link");
        return;
      }
      const result = await res.json();
      setData(result);
    } catch {
      setError("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Laden...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const { patient, case: caseData, requirements, documents } = data;
  const completedCount = requirements.filter((r) => r.status === "ACCEPTED" || r.status === "COMPLETED").length;
  const totalCount = requirements.length;

  return (
    <div className="min-vh-100" style={{ background: "#f8fafc" }}>
      <div className="container py-5" style={{ maxWidth: "720px" }}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: "72px", height: "72px", background: "#eff6ff" }}>
            <Shield size={32} className="text-primary" />
          </div>
          <h1 className="h3 mb-1">Transplant Passport</h1>
          <p className="text-muted small">Verifizierte Zusammenfassung für externe Ärzte</p>
        </div>

        {/* Patient */}
        <div className="card shadow-sm mb-3">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <CheckCircle size={18} className="text-success" />
              Patientendaten
            </h5>
          </div>
          <div className="card-body">
            <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
            <p><strong>Geburtsdatum:</strong> {new Date(patient.dateOfBirth).toLocaleDateString("de-DE")}</p>
            <p><strong>E-Mail:</strong> {patient.email}</p>
            <p><strong>Telefon:</strong> {patient.phone}</p>
          </div>
        </div>

        {/* Fall */}
        <div className="card shadow-sm mb-3">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <Clock size={18} className="text-primary" />
              Fall-Informationen
            </h5>
          </div>
          <div className="card-body">
            <p><strong>Programm:</strong> {caseData.programName} ({caseData.programType})</p>
            <p><strong>Status:</strong> {caseData.status}</p>
            <p><strong>Einweisung:</strong> {caseData.referralDate ? new Date(caseData.referralDate).toLocaleDateString("de-DE") : "—"}</p>
            {caseData.waitlistedDate && (
              <p><strong>Wartelisteneintrag:</strong> {new Date(caseData.waitlistedDate).toLocaleDateString("de-DE")}</p>
            )}
          </div>
        </div>

        {/* Fortschritt */}
        <div className="card shadow-sm mb-3">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <FileText size={18} className="text-warning" />
              Untersuchungen ({completedCount} von {totalCount} erledigt)
            </h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Untersuchung</th>
                    <th>Status</th>
                    <th>Gültig bis</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((req) => (
                    <tr key={req.title}>
                      <td>{req.title}</td>
                      <td>
                        <span className={`badge ${req.status === "ACCEPTED" ? "bg-success" : req.status === "PENDING" ? "bg-warning text-dark" : "bg-secondary"}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>{req.expiresAt ? new Date(req.expiresAt).toLocaleDateString("de-DE") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dokumente */}
        {documents.length > 0 && (
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Dokumente ({documents.length})</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {documents.map((doc) => (
                  <li key={doc.filename} className="list-group-item px-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{doc.filename}</span>
                      <span className="badge bg-secondary">{doc.processingStatus}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-4 text-muted small">
          <p>Dieser Link ist nur für autorisierte Personen bestimmt.</p>
          <p>Erstellt von NephroAssist · {new Date().toLocaleDateString("de-DE")}</p>
        </div>
      </div>
    </div>
  );
}
