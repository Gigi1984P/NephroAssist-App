"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  Settings,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  Menu,
  ChevronRight,
  LogOut,
  GripVertical,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  roles: string[];
  children?: { title: string; href: string }[];
}

const sidebarItems: SidebarItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER", "DIALYSIS_STAFF"] },
  { title: "Patienten", href: "/dashboard/patients", icon: Users, roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"] },
  { title: "Termine", href: "/dashboard/appointments", icon: Calendar, roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER", "DIALYSIS_STAFF"] },
  { title: "Untersuchungen", icon: CheckSquare, roles: ["PATIENT", "CAREGIVER"], children: [
    { title: "Meine Untersuchungen", href: "/dashboard/tasks" },
  ] },
  { title: "Dokumente", href: "/dashboard/documents", icon: FileText, roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER"] },
  { title: "Blocker", href: "/dashboard/blockers", icon: AlertTriangle, roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"] },
  { title: "Statistiken", href: "/dashboard/admin/reports", icon: BarChart3, roles: ["ADMIN", "COORDINATOR"] },
  { title: "Audit Log", href: "/dashboard/admin/audit", icon: ClipboardList, roles: ["ADMIN"] },
  { title: "Admin", href: "/dashboard/admin", icon: ShieldCheck, roles: ["ADMIN"] },
];

/* ================================================================ */
/*  Resizable Sidebar Hook                                          */
/* ================================================================ */
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 260;
const STORAGE_KEY = "nephro-sidebar-width";

function useResizableSidebar() {
  const [width, setWidth] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Math.min(Math.max(parseInt(saved, 10), MIN_WIDTH), MAX_WIDTH) : DEFAULT_WIDTH;
    }
    return DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = React.useState(false);

  const startResize = React.useCallback(() => setIsResizing(true), []);

  const stopResize = React.useCallback(() => {
    setIsResizing(false);
    localStorage.setItem(STORAGE_KEY, width.toString());
  }, [width]);

  const doResize = React.useCallback(
    (clientX: number, sidebarLeft: number) => {
      const newWidth = clientX - sidebarLeft;
      const clamped = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
      setWidth(clamped);
    },
    []
  );

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebar = document.querySelector(".sidebar-desktop");
      if (sidebar) {
        const rect = sidebar.getBoundingClientRect();
        doResize(e.clientX, rect.left);
      }
    };
    const handleMouseUp = () => {
      if (isResizing) stopResize();
    };

    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, doResize, stopResize]);

  return { width, isResizing, startResize };
}

/* ================================================================ */
/*  Sidebar Components                                              */
/* ================================================================ */
interface SidebarProps {
  role: string;
  userName?: string | null;
  userEmail: string;
}

function SidebarNavItem({
  item,
  role,
}: {
  item: SidebarItem;
  role: string;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
        >
          <Icon className="sidebar-nav-icon" />
          <span className="flex-grow-1 text-start">{item.title}</span>
          <ChevronRight
            className="sidebar-nav-icon"
            style={{
              transform: isOpen ? "rotate(90deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          />
        </button>
        {isOpen && (
          <div className="ms-3 ps-2 border-start border-secondary-subtle" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`sidebar-nav-item ${isActive(child.href) ? "active" : ""}`}
                style={{ fontSize: "0.85rem" }}
              >
                <span className="ps-2">{child.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
    >
      <Icon className="sidebar-nav-icon" />
      <span>{item.title}</span>
    </Link>
  );
}

function SidebarContent({ role, userName, userEmail, width }: SidebarProps & { width: number }) {
  const router = useRouter();

  const filteredItems = sidebarItems.filter((item) => item.roles.includes(role));

  return (
    <div
      className="sidebar sidebar-desktop d-none d-lg-flex"
      style={{
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 1040,
        transition: "none",
      }}
    >
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>
            NephroAssist
          </div>
          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Transplant Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {filteredItems.map((item) => (
          <SidebarNavItem key={item.title} item={item} role={role} />
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="sidebar-user-avatar">
            {(userName?.charAt(0) || userEmail.charAt(0)).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-truncate" style={{ fontSize: "0.85rem", fontWeight: 500, color: "#fff" }}>
              {userName || "Benutzer"}
            </div>
            <div className="text-truncate" style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              {userEmail}
            </div>
          </div>
        </div>
        <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "0.75rem 0" }} />
        <Link href="/dashboard/settings" className="sidebar-nav-item">
          <Settings className="sidebar-nav-icon" />
          <span>Einstellungen</span>
        </Link>
        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            router.push("/login");
          }}
          className="sidebar-logout-btn"
        >
          <LogOut className="sidebar-nav-icon" />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  Exports                                                         */
/* ================================================================ */
export function Sidebar(props: SidebarProps) {
  const { width, isResizing, startResize } = useResizableSidebar();

  return (
    <>
      <SidebarContent {...props} width={width} />
      {/* Resize Handle */}
      <div
        className="d-none d-lg-block"
        onMouseDown={startResize}
        style={{
          position: "fixed",
          top: 0,
          left: `${width - 3}px`,
          bottom: 0,
          width: "6px",
          cursor: "col-resize",
          zIndex: 1041,
          background: isResizing ? "rgba(59,130,246,0.3)" : "transparent",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!isResizing) e.currentTarget.style.background = "rgba(59,130,246,0.15)";
        }}
        onMouseLeave={(e) => {
          if (!isResizing) e.currentTarget.style.background = "transparent";
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: isResizing ? "#3b82f6" : "transparent",
            transition: "color 0.15s",
          }}
        >
          <GripVertical size={14} />
        </div>
      </div>
    </>
  );
}

export function MobileSidebar({ role, userName, userEmail }: SidebarProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  const filteredItems = sidebarItems.filter((item) => item.roles.includes(role));

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-light btn-sm d-lg-none"
        type="button"
      >
        <Menu size={18} />
      </button>

      {open && (
        <>
          <div
            className="sidebar-backdrop show d-lg-none"
            onClick={() => setOpen(false)}
          />
          <div className="sidebar show d-lg-none" style={{ zIndex: 1045 }}>
            <div className="sidebar-header">
              <div className="sidebar-brand-icon">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>
                  NephroAssist
                </div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Transplant Platform</div>
              </div>
            </div>

            <div className="sidebar-nav">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isMenuOpen = openMenus[item.title];

                if (hasChildren) {
                  return (
                    <div className="mb-1" key={item.title}>
                      <button
                        onClick={() =>
                          setOpenMenus((prev) => ({
                            ...prev,
                            [item.title]: !prev[item.title],
                          }))
                        }
                        className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
                      >
                        <Icon className="sidebar-nav-icon" />
                        <span className="flex-grow-1 text-start">{item.title}</span>
                        <ChevronRight
                          size={16}
                          style={{
                            transform: isMenuOpen ? "rotate(90deg)" : "rotate(0)",
                            transition: "transform 0.2s",
                          }}
                        />
                      </button>
                      {isMenuOpen && (
                        <div className="ms-3 ps-2 border-start" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                          {item.children?.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className={`sidebar-nav-item ${isActive(child.href) ? "active" : ""}`}
                              style={{ fontSize: "0.85rem" }}
                            >
                              <span className="ps-2">{child.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.title}
                    href={item.href || "#"}
                    onClick={() => setOpen(false)}
                    className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
                  >
                    <Icon className="sidebar-nav-icon" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>

            <div className="sidebar-footer">
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="sidebar-user-avatar">
                  {(userName?.charAt(0) || userEmail.charAt(0)).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-truncate" style={{ fontSize: "0.85rem", fontWeight: 500, color: "#fff" }}>
                    {userName || "Benutzer"}
                  </div>
                  <div className="text-truncate" style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {userEmail}
                  </div>
                </div>
              </div>
              <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "0.75rem 0" }} />
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="sidebar-nav-item"
              >
                <Settings className="sidebar-nav-icon" />
                <span>Einstellungen</span>
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/logout", { method: "POST" });
                  setOpen(false);
                  router.push("/login");
                }}
                className="sidebar-logout-btn"
              >
                <LogOut className="sidebar-nav-icon" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
