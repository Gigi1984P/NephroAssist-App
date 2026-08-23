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
  { title: "Aufgaben", icon: CheckSquare, roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER"], children: [{ title: "Alle Aufgaben", href: "/dashboard/tasks" }] },
  { title: "Dokumente", href: "/dashboard/documents", icon: FileText, roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER"] },
  { title: "Statistiken", href: "/dashboard/admin/reports", icon: BarChart3, roles: ["ADMIN", "COORDINATOR"] },
  { title: "Audit Log", href: "/dashboard/admin/audit", icon: ClipboardList, roles: ["ADMIN"] },
  { title: "Admin", href: "/dashboard/admin", icon: ShieldCheck, roles: ["ADMIN"] },
];

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

function SidebarContent({ role, userName, userEmail }: SidebarProps) {
  const router = useRouter();

  const filteredItems = sidebarItems.filter((item) => item.roles.includes(role));

  return (
    <div className="sidebar d-none d-lg-flex">
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

export function Sidebar(props: SidebarProps) {
  return <SidebarContent {...props} />;
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

      {/* Mobile Sidebar Overlay */}
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
