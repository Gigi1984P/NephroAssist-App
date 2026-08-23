import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import Link from "next/link";

export default async function PatientsPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  if (!["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"].includes(userRole || "")) {
    redirect("/dashboard");
  }

  const patients = await prisma.patient.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      cases: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patienten</h2>
          <p className="text-muted-foreground">
            Verwalten Sie alle Patienten im System
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Patient
        </Button>
      </div>

      <div className="grid gap-4">
        {patients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Keine Patienten gefunden</p>
              <p className="text-sm text-muted-foreground">
                Fügen Sie Ihren ersten Patienten hinzu
              </p>
            </CardContent>
          </Card>
        ) : (
          patients.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {patient.email || "Keine E-Mail"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={patient.consentStatus === "CONSENT_GRANTED" ? "default" : "secondary"}>
                    {patient.consentStatus === "CONSENT_GRANTED" ? "Einverstanden" : "Ausstehend"}
                  </Badge>
                  <Link href={`/dashboard/patients/${patient.id}`}>
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
