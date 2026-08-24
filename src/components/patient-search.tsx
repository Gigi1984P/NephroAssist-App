"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Phone, Mail } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

export default function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filtered, setFiltered] = useState<Patient[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/patients/overview", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setPatients(data.patients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }
    const q = query.toLowerCase();
    const results = patients.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q)
      );
    });
    setFiltered(results.slice(0, 8));
    setShowResults(true);
  }, [query, patients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (patientId: string) => {
    setQuery("");
    setShowResults(false);
    router.push(`/dashboard/patients/${patientId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter" && filtered.length > 0) {
      handleSelect(filtered[0].id);
    }
  };

  return (
    <div ref={wrapperRef} className="position-relative" style={{ width: 320 }}>
      <div className="input-group input-group-sm">
        <span className="input-group-text bg-white border-end-0">
          <Search size={14} className="text-muted" />
        </span>
        <input
          ref={inputRef}
          type="text"
          className="form-control border-start-0 ps-0"
          placeholder="Patient suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {query && (
          <button
            className="btn btn-outline-secondary border-start-0"
            type="button"
            onClick={() => { setQuery(""); setShowResults(false); }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {showResults && (
        <div
          className="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
          style={{ zIndex: 1050, maxHeight: 350, overflowY: "auto" }}
        >
          {loading ? (
            <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>
              Laden...
            </div>
          ) : filtered.length === 0 ? (
            query.trim() ? (
              <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>
                Keine Patienten gefunden
              </div>
            ) : null
          ) : (
            <div className="list-group list-group-flush">
              {filtered.map((patient) => (
                <button
                  key={patient.id}
                  className="list-group-item list-group-item-action py-2 px-3"
                  onClick={() => handleSelect(patient.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        background: "#0d6efd",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                      }}
                    >
                      {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <div className="flex-grow-1 text-start">
                      <div className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="d-flex gap-2 text-muted" style={{ fontSize: "0.75rem" }}>
                        {patient.phone && (
                          <span className="d-flex align-items-center gap-1">
                            <Phone size={10} /> {patient.phone}
                          </span>
                        )}
                        {patient.email && (
                          <span className="d-flex align-items-center gap-1">
                            <Mail size={10} /> {patient.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
