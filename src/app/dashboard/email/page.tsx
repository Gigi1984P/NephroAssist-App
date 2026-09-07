"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { useTranslation } from "@/components/i18n-provider";
import {
  Send,
  Inbox,
  MailCheck,
  FileEdit,
  Plus,
  ArrowLeft,
  Clock,
  AlertTriangle,
  User,
  Search,
} from "lucide-react";

interface EmailMessage {
  id: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  status: "DRAFT" | "SENT" | "FAILED";
  sentAt?: string;
  createdAt: string;
  patient?: { id: string; firstName: string; lastName: string } | null;
}

type EmailFolder = "inbox" | "sent" | "drafts";

export default function EmailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState<EmailFolder>("inbox");
  const [search, setSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [sending, setSending] = useState(false);

  // Form state
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    loadEmails();
  }, [folder]);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/email?folder=${folder}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Email load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!to || !subject) return;
    setSending(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
      if (res.ok) {
        setShowCompose(false);
        setTo("");
        setSubject("");
        setBody("");
        setFolder("sent");
        loadEmails();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Fehler beim Senden");
      }
    } catch (error) {
      alert("Netzwerkfehler");
    } finally {
      setSending(false);
    }
  };

  const saveDraft = async () => {
    if (!to && !subject) return;
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
      if (res.ok) {
        setShowCompose(false);
        setTo("");
        setSubject("");
        setBody("");
        setFolder("drafts");
        loadEmails();
      }
    } catch (error) {
      console.error("Draft save error:", error);
    }
  };

  const filtered = emails.filter((e) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      e.subject.toLowerCase().includes(q) ||
      e.fromEmail.toLowerCase().includes(q) ||
      e.toEmail.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selectedEmail) {
    return (
      <div className="container-fluid">
        <PageHeader
          title={selectedEmail.subject}
          description={t("email.detail", "E-Mail-Detail")}
          action={
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => setSelectedEmail(null)}>
              <ArrowLeft size={16} /> {t("nav.back", "Zurück")}
            </button>
          }
        />
        <div className="dashboard-card">
          <div className="p-4">
            <div className="mb-3">
              <div className="text-muted small">{t("common.email", "E-Mail")}: {selectedEmail.fromEmail} → {selectedEmail.toEmail}</div>
              <div className="text-muted small"><Clock size={12} /> {formatDate(selectedEmail.sentAt || selectedEmail.createdAt)}</div>
            </div>
            <hr />
            <div className="mt-3" style={{ whiteSpace: "pre-wrap" }}>{selectedEmail.body}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={t("email.title", "E-Mail")}
        description={t("email.desc", "SMTP-basierte E-Mail-Kommunikation")}
        action={
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowCompose(true)}>
            <Plus size={16} /> {t("email.compose", "Neue E-Mail")}
          </button>
        }
      />

      <div className="dashboard-card">
        {/* Folder Tabs */}
        <div className="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="btn-group btn-group-sm">
            {(["inbox", "sent", "drafts"] as EmailFolder[]).map((f) => (
              <button
                key={f}
                data-testid={`email-folder-${f}`}
                className={`btn ${folder === f ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFolder(f)}
              >
                {f === "inbox" && <><Inbox size={14} /> {t("email.inbox", "Posteingang")}</>}
                {f === "sent" && <><MailCheck size={14} /> {t("email.sent", "Gesendet")}</>}
                {f === "drafts" && <><FileEdit size={14} /> {t("email.drafts", "Entwürfe")}</>}
              </button>
            ))}
          </div>
          <div className="search-bar">
            <Search size={16} className="search-bar-icon" />
            <input
              type="text"
              placeholder={t("email.searchPlaceholder", "Suchen...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Compose Form */}
        {showCompose && (
          <div className="p-3 border-bottom bg-light">
            <div className="mb-2">
              <label className="form-label small fw-medium">{t("common.email", "E-Mail")}:</label>
              <input
                type="email"
                className="form-control form-control-sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <div className="mb-2">
              <label className="form-label small fw-medium">{t("email.subject", "Betreff")}:</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="form-label small fw-medium">{t("email.body", "Nachricht")}:</label>
              <textarea
                className="form-control form-control-sm"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={sendEmail} disabled={sending || !to || !subject}>
                <Send size={14} className="me-1" /> {sending ? t("email.sending", "Wird gesendet...") : t("email.send", "Senden")}
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={saveDraft}>
                {t("email.saveDraft", "Als Entwurf speichern")}
              </button>
              <button className="btn btn-link btn-sm text-danger" onClick={() => setShowCompose(false)}>
                {t("nav.cancel", "Abbrechen")}
              </button>
            </div>
          </div>
        )}

        {/* Email List */}
        <div className="card-body-custom p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <MailCheck size={32} className="mb-2 opacity-50" />
              <p className="mb-0">{t("email.empty", "Keine E-Mails")}</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filtered.map((email) => (
                <button
                  key={email.id}
                  className="list-group-item list-group-item-action text-start py-3 px-4 d-flex align-items-center gap-3"
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex-shrink-0">
                    <div className="avatar-sm avatar-blue d-flex align-items-center justify-content-center">
                      <User size={14} />
                    </div>
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-medium text-truncate">{email.subject}</span>
                      <span className="text-muted small flex-shrink-0 ms-2">{formatDate(email.sentAt || email.createdAt)}</span>
                    </div>
                    <div className="text-muted small d-flex gap-2">
                      <span>{folder === "inbox" ? email.fromEmail : email.toEmail}</span>
                      {email.status === "FAILED" && (
                        <span className="badge bg-danger"><AlertTriangle size={10} /> Fehlgeschlagen</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
