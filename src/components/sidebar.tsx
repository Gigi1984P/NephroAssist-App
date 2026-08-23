"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER", "DIALYSIS_STAFF"],
  },
  {
    title: "Patienten",
    href: "/dashboard/patients",
    icon: Users,
    roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"],
  },
  {
    title: "Termine",
    href: "/dashboard/appointments",
    icon: Calendar,
    roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER", "DIALYSIS_STAFF"],
  },
  {
    title: "Aufgaben",
    icon: CheckSquare,
    roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER"],
    children: [
      { title: "Alle Aufgaben", href: "/dashboard/tasks" },
    ],
  },
  {
    title: "Dokumente",
    href: "/dashboard/documents",
    icon: FileText,
    roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER"],
  },
  {
    title: "Statistiken",
    href: "/dashboard/admin/reports",
    icon: BarChart3,
    roles: ["ADMIN", "COORDINATOR"],
  },
  {
    title: "Audit Log",
    href: "/dashboard/admin/audit",
    icon: ClipboardList,
    roles: ["ADMIN"],
  },
  {
    title: "Admin",
    href: "/dashboard/admin",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
];

const sidebarVariants = cva(
  "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-[#0f172a] text-white transition-all duration-300 ease-in-out",
  {
    variants: {
      collapsed: {
        true: "w-[72px]",
        false: "w-[260px]",
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
);

interface SidebarProps {
  role: string;
  userName?: string | null;
  userEmail: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ role, userName, userEmail, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  const filteredItems = sidebarItems.filter((item) => item.roles.includes(role));

  const toggleMenu = (title: string) => {
    if (collapsed) return;
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(sidebarVariants({ collapsed }))}>
        {/* Header */}
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">NephroAssist</span>
                <span className="text-[10px] text-slate-400">Transplant Platform</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus[item.title];

              if (collapsed) {
                return (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href || "#"}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                          isActive(item.href)
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              if (hasChildren) {
                return (
                  <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleMenu(item.title)}>
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive(item.href)
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            isOpen && "rotate-90"
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                      <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
                        {item.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "rounded-md px-3 py-1.5 text-sm transition-colors",
                              isActive(child.href)
                                ? "bg-blue-600/20 text-blue-300"
                                : "text-slate-400 hover:text-white"
                            )}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
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
        </ScrollArea>

        {/* Bottom */}
        <div className="border-t border-white/10 p-3">
          <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-medium">
              {(userName?.charAt(0) || userEmail.charAt(0)).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-white">
                  {userName || "Benutzer"}
                </span>
                <span className="truncate text-xs text-slate-400">{userEmail}</span>
              </div>
            )}
          </div>
          <Separator className="my-3 bg-white/10" />
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white",
              collapsed && "justify-center"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Einstellungen</span>}
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              router.push("/login");
              router.refresh();
            }}
            className={cn(
              "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Abmelden</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

export function MobileSidebar({ role, userName, userEmail }: Omit<SidebarProps, "collapsed" | "onToggle">) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] bg-[#0f172a] p-0 border-r-white/10">
        <Sidebar role={role} userName={userName} userEmail={userEmail} />
      </SheetContent>
    </Sheet>
  );
}
