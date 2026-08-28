"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, User } from "lucide-react";

interface Comment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

interface Props {
  patientId: string;
}

export default function PatientCommentBox({ patientId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = () => {
    fetch(`/api/patients/${patientId}/comments`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.comments) setComments(d.comments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [patientId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    await fetch(`/api/patients/${patientId}/comments`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    setNewComment("");
    setSending(false);
    load();
  };

  return (
    <div className="dashboard-card mb-4">
      <div className="card-header-custom d-flex align-items-center gap-2">
        <MessageCircle size={18} />
        <span className="fw-semibold">Team-Kommentare</span>
        <span className="badge bg-secondary">{comments.length}</span>
      </div>
      <div className="card-body-custom">
        {loading ? (
          <p className="text-muted">Laden...</p>
        ) : comments.length === 0 ? (
          <div className="text-center text-muted py-3" style={{ fontSize: "0.85rem" }}>
            Noch keine Kommentare. Schreiben Sie den ersten!
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 mb-3" style={{ maxHeight: 300, overflowY: "auto" }}>
            {comments.map((c) => (
              <div key={c.id} className="d-flex gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                  style={{ width: 28, height: 28, background: "#3b82f6", fontSize: "0.7rem", flexShrink: 0 }}
                >
                  {(c.authorName?.charAt(0) || "?").toUpperCase()}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold" style={{ fontSize: "0.8rem" }}>{c.authorName}</span>
                    <span className="badge bg-light text-dark" style={{ fontSize: "0.6rem" }}>{c.authorRole}</span>
                    <span className="text-muted ms-auto" style={{ fontSize: "0.7rem" }}>
                      {new Date(c.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="mt-1" style={{ fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>{c.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Kommentar schreiben..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
            onClick={handleSubmit}
            disabled={sending || !newComment.trim()}
          >
            <Send size={14} />
            {sending ? "..." : "Senden"}
          </button>
        </div>
      </div>
    </div>
  );
}
