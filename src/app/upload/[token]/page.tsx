"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Upload, CheckCircle, AlertTriangle } from "lucide-react";

export default function UploadPage() {
  const params = useParams();
  const token = params?.token as string;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !token) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/upload/${token}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload fehlgeschlagen");
        return;
      }

      setSuccess("Datei erfolgreich hochgeladen! Vielen Dank.");
      setFile(null);
    } catch {
      setError("Netzwerkfehler beim Upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f8fafc" }}>
      <div className="card shadow-sm" style={{ maxWidth: "480px", width: "100%" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: "64px", height: "64px", background: "#eff6ff" }}>
              <Upload size={28} className="text-primary" />
            </div>
            <h4 className="mb-1">Dokument hochladen</h4>
            <p className="text-muted small mb-0">
              Laden Sie hier Ihr Dokument für das Transplantationszentrum hoch.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {!success && (
            <form onSubmit={handleUpload}>
              <div className="mb-3">
                <label className="form-label">Datei auswählen</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
                <div className="form-text">Erlaubt: PDF, JPG, PNG, DOC (max. 10 MB)</div>
              </div>

              {file && (
                <div className="mb-3 p-2 rounded" style={{ background: "#f1f5f9" }}>
                  <span className="small">📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={uploading || !file}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Wird hochgeladen...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="me-2" />
                    Hochladen
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
