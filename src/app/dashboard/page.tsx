import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  FileText,
  CheckSquare,
  Users,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const [patientCount, upcomingAppointments, pendingTasks, activeBlockers] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({ where: { startTime: { gte: new Date() }, status: "PLANNED" } }),
    prisma.task.count({ where: { status: "PENDING" } }),
    prisma.blocker.count({ where: { status: "ACTIVE" } }),
  ]);

  const [recentTasks, recentAppointments, recentDocuments] = await Promise.all([
    prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        requirement: {
          include: {
            patientCase: {
              include: {
                patient: true,
              },
            },
          },
        },
      },
    }),
    prisma.appointment.findMany({
      orderBy: { startTime: "asc" },
      take: 5,
      include: {
        patient: true,
      },
    }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        patient: true,
      },
    }),
  ]);

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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Patienten</span>
            </div>
            <p className="text-2xl font-bold">{patientCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Termine</span>
            </div>
            <p className="text-2xl font-bold">{upcomingAppointments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Aufgaben</span>
            </div>
            <p className="text-2xl font-bold">{pendingTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Blocker</span>
            </div>
            <p className="text-2xl font-bold">{activeBlockers}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
          <TabsTrigger value="appointments">Termine</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Letzte Aufgaben</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.requirement?.patientCase?.patient.firstName}{" "}
                          {task.requirement?.patientCase?.patient.lastName}
                        </p>
                        {task.dueDate && (
                          <p className="text-sm text-muted-foreground">
                            Fällig: {new Date(task.dueDate).toLocaleDateString("de-DE")}
                          </p>
                        )}
                      </div>
                      <Link href={`/dashboard/tasks/${task.id}`}>
                        <Button variant="outline" size="sm">Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Letzte Termine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{apt.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.patient.firstName} {apt.patient.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(apt.startTime).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                      <Link href={`/dashboard/appointments/${apt.id}`}>
                        <Button variant="outline" size="sm">Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {recentTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.requirement?.patientCase?.patient.firstName}{" "}
                      {task.requirement?.patientCase?.patient.lastName}
                    </p>
                  </div>
                  <Badge variant="outline">{task.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4">
            {recentAppointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{apt.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {apt.patient.firstName} {apt.patient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(apt.startTime).toLocaleDateString("de-DE", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge variant="outline">{apt.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4">
            {recentDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.patient.firstName} {doc.patient.lastName}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{doc.processingStatus}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}