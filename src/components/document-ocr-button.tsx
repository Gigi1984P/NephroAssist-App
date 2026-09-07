"use client";

import { useState } from "react";
import { ScanText, Loader2 } from "lucide-react";

interface DocumentOcrButtonProps {
  documentId: string;
}

export function DocumentOcrButton({ documentId }: DocumentOcrButtonProps) {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ extractedItems: any[]; confidence?: number } | null>(null);
  const [error, setError] = useState("");

  const handleOcr = async () => {
    setProcessing(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/ocr`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "OCR-Fehler");
      }
    } catch (err) {
      setError("Netzwerkfehler");
    } finally {
      setProcessing(false);
    }
  };

  const fetchResults = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/ocr`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.hasOcrResults) {
        setResult({
          extractedItems: data.extractedItems || [],
          confidence: data.latestLog?.confidence,
        });
      }
    } catch { /* ignore */ }
    finally { setProcessing(false); }
  };

  return (
    <div className="d-flex flex-column gap-2">
      <button
        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
        onClick={result ? fetchResults : handleOcr}
        disabled={processing}
      >
        {processing ? (
          <><Loader2 size={14} className="spin" /> OCR...</>
        ) : (
          <><ScanText size={14} /> AI-OCR</>
        )}
      </button>

      {error && <div className="alert alert-danger py-1 px-2 small">{error}</div>}

      {result && result.extractedItems.length > 0 && (
        <div className="border rounded p-2 bg-light">
          <div className="fw-medium small mb-1">Extrahierte Daten:</div>
          {result.extractedItems.map((item: any, i: number) => (
            <div key={i} className="small d-flex justify-content-between">
              <span>{item.itemType}: {item.description || item.value}</span>
              <span className="text-muted">{Math.round((item.confidence || 0) * 100)}%</span>
            </div>
          ))}
          {result.confidence && (
            <div className="text-muted small mt-1">Gesamt-Confidence: {Math.round(result.confidence * 100)}%</div>
          )}
        </div>
      )}
    </div>
  );
}
