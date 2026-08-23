import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUpload } from "@/components/document-upload";
import {
  Calendar,
  FileText,
  CheckSquare,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      cases: {
        include: {
          program: true,
          requirements: {
            include: {
              tasks: true,
            },
          },
        },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      appointments: {
        orderBy: { startTime: "asc" },
      },
      notifications: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      helpRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!patient) {
    notFound();
  }

  const activeCase = patient.cases[0];
  const pendingTasks = activeCase?.requirements.flatMap((r) => r.tasks).filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS") || [];
  const upcomingAppointments = patient.appointments.filter((a) => new Date(a.startTime) > new Date());
  const activeBlockers = activeCase ? await prisma.blocker.findMany({ where: { caseId: activeCase.id, status: "ACTIVE" } }) : [];

  const statusColors: Record<string, string> = {
    REFERRAL: "bg-slate-100 text-slate-800",
    INTAKE: "bg-blue-100 text-blue-800",
    EVALUATION: "bg-yellow-100 text-yellow-800",
    READY_FOR_REVIEW: "bg-orange-100 text-orange-800",
    UNDER_REVIEW: "bg-purple-100 text-purple-800",
    DEFERRED: "bg-red-100 text-red-800",
    APPROVED: "bg-green-100 text-green-800",
    WAITLISTED: "bg-teal-100 text-teal-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    TRANSPLANTED: "bg-green-200 text-green-900",
    CLOSED: "bg-slate-200 text-slate-900",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-muted-foreground">
            {patient.email} • {patient.phone || "Keine Telefonnummer"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[activeCase?.status || "REFERRAL"]}>
            {activeCase?.status || "Kein Fall"}
          </Badge>
          <Badge variant="outline">{patient.consentStatus === "CONSENT_GRANTED" ? "Einverstanden" : "Ausstehend"}</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Termine</span>
            </div>
            <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Dokumente</span>
            </div>
            <p className="text-2xl font-bold">{patient.documents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Offene Untersuchungen</span>
            </div>
            <p className="text-2xl font-bold">{pendingTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Blocker</span>
            </div>
            <p className="text-2xl font-bold">{activeBlockers.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="requirements">Anforderungen</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
          <TabsTrigger value="appointments">Termine</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="messages">Nachrichten</TabsTrigger>
        </TabsList>

        {/* Übersicht Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Aktive Blocker */}
            {activeBlockers.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Aktive Blocker
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeBlockers.map((blocker) => (
                    <div key={blocker.id} className="rounded-lg bg-red-50 p-3">
                      <p className="font-medium text-red-800">{blocker.type}</p>
                      <p className="text-sm text-red-600">{blocker.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Nächste Termine */}
            <Card>
              <CardHeader>
                <CardTitle>Nächste Termine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{appointment.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.startTime).toLocaleDateString("de-DE", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge variant={appointment.status === "CONFIRMED" ? "default" : "secondary"}>
                      {appointment.status === "CONFIRMED" ? "Bestätigt" : "Geplant"}
                    </Badge>
                  </div>
                ))}
                {upcomingAppointments.length === 0 && (
                  <p className="text-sm text-muted-foreground">Keine anstehenden Termine</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Offene Untersuchungen */}
          {pendingTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Offene Untersuchungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{task.title}</p>
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
          )}
        </TabsContent>

        {/* Anforderungen Tab */}
        <TabsContent value="requirements" className="space-y-4">
          {activeCase?.requirements.map((requirement) => (
            <Card key={requirement.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{requirement.title}</CardTitle>
                  <Badge
                    variant={
                      requirement.status === "ACCEPTED"
                        ? "default"
                        : requirement.status === "REJECTED"
                        ? "destructive"
                        : requirement.status === "IN_PROGRESS"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {requirement.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{requirement.description}</p>
                <div className="space-y-2">
                  {requirement.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{task.title}</p>
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
          ))}
        </TabsContent>

        {/* Dokumente Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-end">
            <DocumentUpload patientId={patient.id} />
          </div>
          <div className="grid gap-4">
            {patient.documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString("de-DE")} •{" "}
                        {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      doc.processingStatus === "ACCEPTED"
                        ? "default"
                        : doc.processingStatus === "REJECTED"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {doc.processingStatus === "ACCEPTED"
                      ? "Akzeptiert"
                      : doc.processingStatus === "REJECTED"
                      ? "Abgelehnt"
                      : "In Prüfung"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Termine Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4">
            {patient.appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{appointment.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.startTime).toLocaleDateString("de-DE", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {appointment.location && (
                        <p className="text-sm text-muted-foreground">{appointment.location}</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      appointment.status === "CONFIRMED"
                        ? "default"
                        : appointment.status === "PLANNED"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {appointment.status === "CONFIRMED"
                      ? "Bestätigt"
                      : appointment.status === "PLANNED"
                      ? "Geplant"
                      : "Storniert"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zeitlicher Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline events would be loaded here */}
                <p className="text-sm text-muted-foreground">Timeline-Events werden in einer zukünftigen Version verfügbar sein.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nachrichten Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Letzte Nachrichten
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Nachrichten vorhanden</p>
                ) : (
                  <div className="space-y-3">
                    {patient.messages.map((message) => (
                      <div key={message.id} className="rounded-lg bg-slate-50 p-3">
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.createdAt).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Hilfsanfragen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.helpRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Hilfsanfragen vorhanden</p>
                ) : (
                  <div className="space-y-3">
                    {patient.helpRequests.map((request) => (
                      <div key={request.id} className="rounded-lg bg-yellow-50 p-3">
                        <p className="font-medium">{request.type}</p>
                        <p className="text-sm">{request.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
