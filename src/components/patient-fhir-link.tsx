"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

interface PatientFhirLinkProps {
  patientId: string;
}

export function PatientFhirLink({ patientId }: PatientFhirLinkProps) {
  const [copied, setCopied] = useState(false);
  const fhirUrl = `/api/fhir/Patient/${patientId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.origin + fhirUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    window.open(fhirUrl, "_blank");
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <ExternalLink size={14} /> FHIR
      </button>
      <ul className="dropdown-menu">
        <li>
          <button className="dropdown-item d-flex align-items-center gap-2" onClick={handleOpen}>
            <ExternalLink size={14} /> FHIR Resource anzeigen
          </button>
        </li>
        <li>
          <button className="dropdown-item d-flex align-items-center gap-2" onClick={handleCopy}>
            {copied ? <><Check size={14} /> Kopiert!</> : <><Copy size={14} /> URL kopieren</>}
          </button>
        </li>
      </ul>
    </div>
  );
}
