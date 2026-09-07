"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";

interface PatientPdfButtonProps {
  patientId: string;
}

export function PatientPdfButton({ patientId }: PatientPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/report`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        // Generiere client-seitig ein PDF (einfache HTML-zu-PDF-Logik)
        generatePdf(data.report);
      } else {
        alert("Fehler beim Laden des Reports");
      }
    } catch {
      alert("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = (report: any) => {
    const html = `
      <html>
        <head><style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
          .header { display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 1.2rem; font-weight: bold; color: #1e40af; }
        </style></head>
        <body>
          <div class="header">
            <div class="logo">NephroAssist</div>
            <div>Patienten-Report | ${new Date(report.generatedAt).toLocaleDateString("de-DE")}</div>
          </div>
          <h1>${report.patient.firstName} ${report.patient.lastName}</h1>
          
          <div><strong>E-Mail:</strong> ${report.patient.email || "—"}</div>
          <div><strong>Geburtsdatum:</strong> ${report.patient.dateOfBirth ? new Date(report.patient.dateOfBirth).toLocaleDateString("de-DE") : "—"}</div>
          <div><strong>Status:</strong> ${report.patient.status}</div>
          <div><strong>Hausarzt:</strong> ${report.patient.gpName || "—"} ${report.patient.gpPhone || ""}</div>
          
          <h2>Zusammenfassung</h2>
          <div>Medikamente: ${report.summary.totalMedications} | Laborwerte: ${report.summary.totalLabValues} | Fälle: ${report.summary.totalCases}</div>
          <div>Offene Tasks: ${report.summary.openTasks} | Anstehende Termine: ${report.summary.upcomingAppointments}</div>
          
          <h2>Medikamente</h2>
          <table>
            <thead><tr><th>Name</th><th>Dosierung</th><th>Häufigkeit</th><th>Von</th></tr></thead>
            <tbody>
              ${report.medications.map((m: any) => `
                <tr><td>${m.name}</td><td>${m.dosage || "—"}</td><td>${m.frequency || "—"}</td><td>${m.startDate ? new Date(m.startDate).toLocaleDateString("de-DE") : "—"}</td></tr>
              `).join("")}
            </tbody>
          </table>
          
          <h2>Laborwerte (Letzte 20)</h2>
          <table>
            <thead><tr><th>Typ</th><th>Wert</th><th>Einheit</th><th>Datum</th></tr></thead>
            <tbody>
              ${report.labValues.map((lv: any) => `
                <tr><td>${lv.type}</td><td>${lv.value}</td><td>${lv.unit || "—"}</td><td>${lv.measuredAt ? new Date(lv.measuredAt).toLocaleDateString("de-DE") : "—"}</td></tr>
              `).join("")}
            </tbody>
          </table>
          
          <h2>Anstehende Termine</h2>
          <table>
            <thead><tr><th>Typ</th><th>Datum</th><th>Ort</th><th>Status</th></tr></thead>
            <tbody>
              ${report.upcomingAppointments.map((a: any) => `
                <tr><td>${a.type}</td><td>${a.startTime ? new Date(a.startTime).toLocaleString("de-DE") : "—"}</td><td>${a.location || "—"}</td><td>${a.status}</td></tr>
              `).join("")}
            </tbody>
          </table>
          
          <div style="margin-top: 40px; font-size: 0.8rem; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px;">
            Generiert von NephroAssist | Vertrauliches medizinisches Dokument
          </div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  return (
    <button
      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <><Loader2 size={14} className="spin" /> PDF...</>
      ) : (
        <><FileDown size={14} /> PDF</>
      )}
    </button>
  );
}
