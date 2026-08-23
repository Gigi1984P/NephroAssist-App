"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
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

function SidebarContent({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  const filteredItems = sidebarItems.filter((item) => item.roles.includes(role));

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex h-full flex-col bg-[#0f172a] text-white">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">NephroAssist</span>
          <span className="text-[10px] text-slate-400">Transplant Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="flex flex-col gap-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.title];

            if (hasChildren) {
              return (
                <div key={item.title} className="flex flex-col">
                  <button
                    onClick={() => setOpenMenus((prev) => ({ ...prev, [item.title]: !prev[item.title] }))}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-90")} />
                  </button>
                  {isOpen && (
                    <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "rounded-md px-3 py-2 text-sm transition-colors",
                            isActive(child.href)
                              ? "bg-blue-600/20 text-blue-300"
                              : "text-slate-400 hover:text-white"
                          )}
                        >
                          {child.title}
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
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-medium">
            {(userName?.charAt(0) || userEmail.charAt(0)).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{userName || "Benutzer"}</span>
            <span className="truncate text-xs text-slate-400">{userEmail}</span>
          </div>
        </div>
        <Separator className="my-2 bg-white/10" />
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span>Einstellungen</span>
        </Link>
        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            router.push("/login");
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <div className="hidden md:flex w-[260px] flex-col fixed inset-y-0 left-0 z-40 border-r border-white/10">
      <SidebarContent {...props} />
    </div>
  );
}

export function MobileSidebar(props: SidebarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] bg-[#0f172a] p-0 border-r border-white/10">
        <SidebarContent {...props} />
      </SheetContent>
    </Sheet>
  );
}
