"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/i18n-provider";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
  entityType: string | null;
  entityId: string | null;
}

export function NotificationCenter() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    // Alle 30 Sekunden aktualisieren
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silent fail
    }
  }

  async function markAsRead(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      await fetchNotifications();
    } catch {
      // Silent fail
    }
  }

  async function markAllAsRead(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) =>
          fetch(`/api/notifications/${n.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        )
      );
      await fetchNotifications();
    } catch {
      // Silent fail
    }
  }

  function getLink(notification: Notification): string | null {
    if (notification.entityType === "TASK" && notification.entityId) {
      return `/dashboard/tasks/${notification.entityId}`;
    }
    if (notification.entityType === "PATIENT_REQUIREMENT" && notification.entityId) {
      return `/dashboard/tasks/${notification.entityId}`;
    }
    return null;
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Gerade eben";
    if (diff < 3600) return `${Math.floor(diff / 60)} Min.`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} Std.`;
    return date.toLocaleDateString("de-DE");
  }

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-link text-decoration-none position-relative p-2"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        aria-label="Benachrichtigungen"
      >
        <Bell size={20} className="text-white" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
            <span className="visually-hidden">ungelesene Benachrichtigungen</span>
          </span>
        )}
      </button>

      {open && (
        <div
          className="dropdown-menu show"
          style={{
            position: "absolute",
            right: 0,
            left: "auto",
            top: "100%",
            width: "360px",
            maxHeight: "500px",
            overflowY: "auto",
            zIndex: 1060,
          }}
        >
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
            <span className="fw-medium">{t("notifications.title", "Benachrichtigungen")}</span>
            {unreadCount > 0 && (
              <button className="btn btn-sm btn-link text-decoration-none" onClick={markAllAsRead}>
                <Check size={14} className="me-1" />
                {t("notifications.allRead", "Alle gelesen")}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <Bell size={24} className="mb-2 opacity-50" />
              <p className="mb-0 small">{t("notifications.none", "Keine Benachrichtigungen")}</p>
            </div>
          ) : (
            notifications.map((n) => {
              const link = getLink(n);
              const content = (
                <div className={`d-flex gap-2 p-2 rounded ${!n.read ? "bg-light" : ""}`}>
                  <div className="flex-grow-1">
                    <p className="mb-0 fw-medium small">{n.title}</p>
                    <p className="mb-0 text-muted small" style={{ fontSize: "0.8rem" }}>
                      {n.message}
                    </p>
                    <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  {!n.read && (
                    <button
                      className="btn btn-sm btn-link text-success p-0"
                      onClick={(e) => markAsRead(n.id, e)}
                      title="Als gelesen markieren"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              );

              return (
                <div key={n.id} className="dropdown-item p-0">
                  {link ? (
                    <Link
                      href={link}
                      className="text-decoration-none text-dark d-block p-2"
                      onClick={() => setOpen(false)}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="p-2">{content}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
