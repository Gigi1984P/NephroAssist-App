"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  Upload,
  FileText,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

interface Document {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  processingStatus: string;
  uploadedBy: string;
  createdAt: string;
  patient: {
    firstName: string;
    lastName: string;
  };
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setSelectedFile(null);
      setShowModal(false);
      loadDocuments();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchTerm === "" ||
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${doc.patient.firstName} ${doc.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || doc.processingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / itemsPerPage));
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "badge-green";
      case "REJECTED":
        return "badge-red";
      case "UPLOADED":
        return "badge-yellow";
      default:
        return "badge-outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "Akzeptiert";
      case "REJECTED":
        return "Abgelehnt";
      case "UPLOADED":
        return "Hochgeladen";
      default:
        return status;
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <div>
      <PageHeader
        title="Dokumente"
        description="Verwalten Sie alle hochgeladenen Dokumente"
        action={
          <button className="btn-custom btn-primary-custom" onClick={() => setShowModal(true)}>
            <Upload size={16} />
            Hochladen
          </button>
        }
      />

      {/* Filters */}
      <div className="dashboard-card mb-4">
        <div className="card-body-custom">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="search-bar">
                <Search size={16} className="search-bar-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Suchen nach Dateiname, Patient..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Alle Status</option>
                <option value="ACCEPTED">Akzeptiert</option>
                <option value="REJECTED">Abgelehnt</option>
                <option value="UPLOADED">Hochgeladen</option>
              </select>
            </div>
            <div className="col-md-3 text-md-end">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                {filteredDocuments.length} Dokumente
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card">
        <div className="card-body-custom p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">Laden...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={24} />
              </div>
              <div className="empty-state-title">Keine Dokumente vorhanden</div>
              <div className="empty-state-desc">
                {searchTerm || statusFilter !== "ALL"
                  ? "Versuchen Sie andere Filtereinstellungen"
                  : "Laden Sie Ihr erstes Dokument hoch"}
              </div>
              <button className="btn-custom btn-primary-custom" onClick={() => setShowModal(true)}>
                <Upload size={16} />
                Dokument hochladen
              </button>
            </div>
          ) : (
            <>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Dateiname</th>
                    <th>Patient</th>
                    <th>Datum</th>
                    <th>Größe</th>
                    <th>Status</th>
                    <th className="actions">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <FileText size={18} style={{ color: "#8b5cf6", flexShrink: 0 }} />
                          <span className="fw-medium">{doc.filename}</span>
                        </div>
                      </td>
                      <td>
                        {doc.patient.firstName} {doc.patient.lastName}
                      </td>
                      <td>{new Date(doc.createdAt).toLocaleDateString("de-DE")}</td>
                      <td>{formatSize(doc.size)}</td>
                      <td>
                        <span className={`badge-custom ${getStatusBadgeClass(doc.processingStatus)}`}>
                          {getStatusLabel(doc.processingStatus)}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="btn-custom btn-outline-custom btn-sm-custom">
                          <Download size={14} />
                          Herunterladen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3 border-top">
                  <ul className="pagination-custom">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={14} />
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => setCurrentPage(page)}>
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => {
              if (!uploading) {
                setShowModal(false);
                setSelectedFile(null);
              }
            }}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Dokument hochladen</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      if (!uploading) {
                        setShowModal(false);
                        setSelectedFile(null);
                      }
                    }}
                    disabled={uploading}
                  />
                </div>
                <div className="modal-body">
                  <div
                    className={`border border-2 border-dashed rounded-3 p-5 text-center ${
                      dragActive ? "border-primary bg-primary-subtle" : "border-secondary-subtle"
                    }`}
                    style={{
                      borderStyle: "dashed",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {selectedFile ? (
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <FileText size={32} style={{ color: "#2563eb" }} />
                          <div className="text-start">
                            <p className="fw-medium mb-0">{selectedFile.name}</p>
                            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                              {formatSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          className="btn btn-link text-danger p-1"
                          onClick={() => setSelectedFile(null)}
                          disabled={uploading}
                          type="button"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={40} className="text-muted mb-2" />
                        <p className="text-muted mb-1">Datei hierher ziehen oder</p>
                        <label className="cursor-pointer" style={{ cursor: "pointer" }}>
                          <span className="text-primary text-decoration-underline">
                            Datei auswählen
                          </span>
                          <input
                            type="file"
                            className="d-none"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedFile(null);
                    }}
                    disabled={uploading}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? "Wird hochgeladen..." : "Hochladen"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
