"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell, Check, Calendar, FileText, CheckSquare, AlertTriangle,
  RefreshCw, MessageSquare, HelpCircle, Info,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  entityType?: string | null;
  entityId?: string | null;
}

const typeIcons: Record<string, React.ReactNode> = {
  TASK: <CheckSquare size={14} className="text-primary" />,
  APPOINTMENT: <Calendar size={14} className="text-success" />,
  DOCUMENT: <FileText size={14} className="text-purple" />,
  REVIEW: <Check size={14} className="text-info" />,
  RENEWAL: <RefreshCw size={14} className="text-warning" />,
  MESSAGE: <MessageSquare size={14} className="text-secondary" />,
  HELP_REQUEST: <HelpCircle size={14} className="text-danger" />,
  SYSTEM: <Info size={14} className="text-muted" />,
};

const typeLabels: Record<string, string> = {
  TASK: "Aufgabe",
  APPOINTMENT: "Termin",
  DOCUMENT: "Dokument",
  REVIEW: "Review",
  RENEWAL: "Erneuerung",
  MESSAGE: "Nachricht",
  HELP_REQUEST: "Hilfe",
  SYSTEM: "System",
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        credentials: "include",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getEntityLink = (n: Notification) => {
    if (!n.entityType || !n.entityId) return null;
    switch (n.entityType) {
      case "APPOINTMENT":
        return "/dashboard/appointments";
      case "PATIENT_REQUIREMENT":
        return "/dashboard/tasks";
      case "DOCUMENT":
        return "/dashboard/documents";
      case "TASK":
        return `/dashboard/tasks/${n.entityId}`;
      default:
        return null;
    }
  };

  return (
    <div ref={dropdownRef} className="position-relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-light btn-sm position-relative p-2"
        style={{ borderRadius: "0.5rem" }}
      >
        <Bell size={18} style={{ color: "#64748b" }} />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.65rem", padding: "0.25em 0.45em" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="position-absolute end-0 mt-1 bg-white border shadow-sm"
          style={{
            width: "360px",
            zIndex: 1050,
            borderRadius: "0.75rem",
            borderColor: "#e2e8f0",
            overflow: "hidden",
          }}
        >
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
            <span className="fw-semibold" style={{ fontSize: "0.875rem" }}>Benachrichtigungen</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn btn-link text-decoration-none p-0"
                style={{ fontSize: "0.75rem", color: "#2563eb" }}
              >
                Alle gelesen
              </button>
            )}
          </div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted" style={{ fontSize: "0.85rem" }}>
                Keine Benachrichtigungen
              </div>
            ) : (
              notifications.map((notification) => {
                const link = getEntityLink(notification);
                const content = (
                  <div
                    key={notification.id}
                    className="d-flex align-items-start justify-content-between p-3 border-bottom"
                    style={{
                      backgroundColor: !notification.read ? "#eff6ff" : "transparent",
                      borderColor: "#f1f5f9",
                      cursor: link ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id);
                    }}
                  >
                    <div className="d-flex align-items-start gap-2 flex-grow-1">
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "#f1f5f9",
                          flexShrink: 0,
                        }}
                      >
                        {typeIcons[notification.type] || <Info size={14} />}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-medium" style={{ fontSize: "0.8rem" }}>{notification.title}</span>
                          <span
                            className="badge-custom"
                            style={{
                              fontSize: "0.6rem",
                              background: "#f1f5f9",
                              color: "#64748b",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {typeLabels[notification.type] || notification.type}
                          </span>
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{notification.message}</div>
                        <div className="text-muted mt-1" style={{ fontSize: "0.7rem" }}>
                          {new Date(notification.createdAt).toLocaleDateString("de-DE", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="btn btn-link text-decoration-none p-1 ms-2 flex-shrink-0"
                        style={{ color: "#2563eb" }}
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                );

                return link ? (
                  <Link
                    key={notification.id}
                    href={link}
                    className="text-decoration-none text-dark"
                    onClick={() => setOpen(false)}
                  >
                    {content}
                  </Link>
                ) : (
                  content
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
