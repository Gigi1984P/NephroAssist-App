import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import Link from "next/link";

export default async function AppointmentsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: "asc" },
    take: 20,
    include: {
      patient: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Termine</h2>
          <p className="text-muted-foreground">
            Alle anstehenden Termine im Überblick
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Termin
        </Button>
      </div>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Keine Termine geplant</p>
              <p className="text-sm text-muted-foreground">
                Erstellen Sie Ihren ersten Termin
              </p>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </p>
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
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
                  <Link href={`/dashboard/appointments/${appointment.id}`}>
                    <Button variant="outline" size="sm">Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
