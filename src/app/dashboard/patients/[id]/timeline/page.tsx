"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Clock, CheckCircle, AlertTriangle, FileText, UserCheck } from "lucide-react";

interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  metadata: any;
  createdAt: string;
}

const eventTypeIcons: Record<string, React.ReactNode> = {
  TASK_COMPLETED: <CheckCircle size={16} className="text-success" />,
  REQUIREMENT_ACCEPTED: <UserCheck size={16} className="text-primary" />,
  TASK_CREATED: <FileText size={16} className="text-info" />,
  BLOCKER_CREATED: <AlertTriangle size={16} className="text-danger" />,
  DOCUMENT_UPLOADED: <FileText size={16} className="text-secondary" />,
};

const eventTypeLabels: Record<string, string> = {
  TASK_COMPLETED: "Erledigt",
  REQUIREMENT_ACCEPTED: "Freigegeben",
  TASK_CREATED: "Erstellt",
  BLOCKER_CREATED: "Blocker",
  DOCUMENT_UPLOADED: "Dokument",
};

export default function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [caseId, setCaseId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params;
        // Patient laden um caseId zu finden
        const patientRes = await fetch(`/api/patients/${id}`, { credentials: "include" });
        if (patientRes.ok) {
          const data = await patientRes.json();
          const cId = data.patient?.cases?.[0]?.id;
          if (cId) {
            setCaseId(cId);
            const timelineRes = await fetch(`/api/timeline?caseId=${cId}`, { credentials: "include" });
            if (timelineRes.ok) {
              const tData = await timelineRes.json();
              setEvents(tData.events || []);
            }
          }
        }
      } catch (error) {
        console.error("Timeline load error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params]);

  return (
    <div>
      <PageHeader
        title="Timeline"
        description="Chronologische Übersicht aller Ereignisse"
      />

      <div className="dashboard-card">
        <div className="card-body-custom">
          {loading ? (
            <div className="text-center text-muted">Laden...</div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Clock size={24} />
              </div>
              <div className="empty-state-title">Keine Ereignisse</div>
              <div className="empty-state-desc">
                Die Timeline wird automatisch bei Status-Änderungen befüllt.
              </div>
            </div>
          ) : (
            <div className="timeline-list">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="timeline-item"
                  style={{
                    display: "flex",
                    gap: "1rem",
                    padding: "1rem 0",
                    borderBottom:
                      index < events.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div
                    className="timeline-icon"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {eventTypeIcons[event.eventType] || (
                      <Clock size={16} />
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge-custom badge-blue">
                        {eventTypeLabels[event.eventType] || event.eventType}
                      </span>
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {new Date(event.createdAt).toLocaleString("de-DE")}
                      </span>
                    </div>
                    <p className="mb-0 mt-1" style={{ fontSize: "0.9rem" }}>
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
