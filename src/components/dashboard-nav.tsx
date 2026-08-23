import Link from "next/link";
import { cn } from "@/lib/utils";
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
  UserCog,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: "Übersicht",
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
    href: "/dashboard/tasks",
    icon: CheckSquare,
    roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER"],
  },
  {
    title: "Dokumente",
    href: "/dashboard/documents",
    icon: FileText,
    roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER"],
  },
  {
    title: "Einstellungen",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER", "DIALYSIS_STAFF"],
  },
  {
    title: "Audit Log",
    href: "/dashboard/admin/audit",
    icon: ClipboardList,
    roles: ["ADMIN"],
  },
  {
    title: "Statistiken",
    href: "/dashboard/admin/reports",
    icon: BarChart3,
    roles: ["ADMIN", "COORDINATOR"],
  },
  {
    title: "Admin",
    href: "/dashboard/admin",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
];

interface DashboardNavProps {
  role: string;
}

export function DashboardNav({ role }: DashboardNavProps) {
  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="grid items-start px-4 text-sm font-medium">
      {filteredItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
