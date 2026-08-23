import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download } from "lucide-react";
import Link from "next/link";

export default async function DocumentsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      patient: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dokumente</h2>
          <p className="text-muted-foreground">
            Alle hochgeladenen Dokumente im Überblick
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Dokument hochladen
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Keine Dokumente vorhanden</p>
              <p className="text-sm text-muted-foreground">
                Laden Sie Ihr erstes Dokument hoch
              </p>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.patient.firstName} {doc.patient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString("de-DE")} •{" "}
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
