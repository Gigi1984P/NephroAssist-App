import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Clock } from "lucide-react";
import Link from "next/link";

export default async function TasksPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const tasks = await prisma.task.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
    },
    orderBy: [
      { status: "asc" },
      { dueDate: "asc" },
    ],
    take: 50,
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
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Aufgaben</h2>
          <p className="text-muted-foreground">
            Verwalten Sie offene und laufende Aufgaben
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neue Aufgabe
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Keine offenen Aufgaben</p>
              <p className="text-sm text-muted-foreground">
                Alle Aufgaben sind erledigt!
              </p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => {
            const patient = task.requirement?.patientCase?.patient;
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

            return (
              <Card key={task.id} className={isOverdue ? "border-red-200" : ""}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isOverdue ? "bg-red-100" : "bg-blue-100"
                    }`}>
                      <Clock className={`h-5 w-5 ${
                        isOverdue ? "text-red-600" : "text-blue-600"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {patient && (
                        <p className="text-sm text-muted-foreground">
                          {patient.firstName} {patient.lastName}
                        </p>
                      )}
                      {task.dueDate && (
                        <p className={`text-sm ${
                          isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                        }`}>
                          Fällig: {new Date(task.dueDate).toLocaleDateString("de-DE")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        task.status === "IN_PROGRESS"
                          ? "default"
                          : isOverdue
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {task.status === "IN_PROGRESS"
                        ? "In Bearbeitung"
                        : isOverdue
                        ? "Überfällig"
                        : "Ausstehend"}
                    </Badge>
                    <Link href={`/dashboard/tasks/${task.id}`}>
                      <Button variant="outline" size="sm">Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
