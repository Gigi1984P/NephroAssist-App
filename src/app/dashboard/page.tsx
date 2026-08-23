import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CheckSquare, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  // Statistiken laden
  const patientCount = await prisma.patient.count();
  const upcomingAppointments = await prisma.appointment.count({
    where: {
      startTime: { gte: new Date() },
      status: "PLANNED",
    },
  });
  const pendingTasks = await prisma.task.count({
    where: { status: "PENDING" },
  });
  const activeBlockers = await prisma.blocker.count({
    where: { status: "ACTIVE" },
  });

  const stats = [
    {
      title: "Patienten",
      value: patientCount,
      icon: Users,
      href: "/dashboard/patients",
      show: ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(userRole || ""),
    },
    {
      title: "Anstehende Termine",
      value: upcomingAppointments,
      icon: Calendar,
      href: "/dashboard/appointments",
      show: true,
    },
    {
      title: "Offene Aufgaben",
      value: pendingTasks,
      icon: CheckSquare,
      href: "/dashboard/tasks",
      show: true,
    },
    {
      title: "Aktive Blocker",
      value: activeBlockers,
      icon: AlertTriangle,
      href: "/dashboard/tasks",
      show: ["ADMIN", "COORDINATOR", "PHYSICIAN"].includes(userRole || ""),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Willkommen zurück{session?.user?.name ? `, ${session.user.name}` : ""}!
        </h2>
        <p className="text-muted-foreground">
          Hier ist ein Überblick über Ihre aktuellen Aktivitäten.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats
          .filter((stat) => stat.show)
          .map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Keine letzten Aktivitäten vorhanden.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/dashboard/appointments"
              className="block rounded-lg border p-3 hover:bg-slate-50 text-sm"
            >
              Neuen Termin erstellen
            </Link>
            <Link
              href="/dashboard/tasks"
              className="block rounded-lg border p-3 hover:bg-slate-50 text-sm"
            >
              Aufgaben verwalten
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
