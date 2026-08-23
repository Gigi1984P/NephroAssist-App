"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

interface TaskDetailProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    dueDate: Date | null;
    requirement: {
      title: string;
      description: string | null;
      category: string;
      patientCase: {
        patient: {
          firstName: string;
          lastName: string;
        };
      };
    } | null;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Ausstehend", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  IN_PROGRESS: { label: "In Bearbeitung", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  COMPLETED: { label: "Erledigt", color: "bg-green-100 text-green-800", icon: CheckCircle },
  OVERDUE: { label: "Überfällig", color: "bg-red-100 text-red-800", icon: XCircle },
  CANCELLED: { label: "Storniert", color: "bg-slate-100 text-slate-800", icon: XCircle },
};

export function TaskDetail({ task }: TaskDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState(task.status);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const currentStatus = statusConfig[status] || statusConfig.PENDING;
  const StatusIcon = currentStatus.icon;

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) {
        throw new Error("Update fehlgeschlagen");
      }

      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && status !== "COMPLETED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Untersuchung bearbeiten</h2>
          <p className="text-muted-foreground">Details und Status verwalten</p>
        </div>
        <Badge className={currentStatus.color}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {currentStatus.label}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Untersuchungen-Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Titel</p>
              <p className="text-lg font-medium">{task.title}</p>
            </div>
            {task.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Beschreibung</p>
                <p>{task.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Zugehörige Anforderung</p>
              <p>{task.requirement?.title || "Keine"}</p>
            </div>
            {task.requirement?.patientCase?.patient && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient</p>
                <p>
                  {task.requirement.patientCase.patient.firstName}{" "}
                  {task.requirement.patientCase.patient.lastName}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fälligkeitsdatum</p>
              <p className={isOverdue ? "text-red-600 font-medium" : ""}>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("de-DE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Kein Datum"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status aktualisieren</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notizen</label>
              <Textarea
                placeholder="Optionaler Kommentar zur Statusänderung..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleStatusUpdate}
              disabled={updating || status === task.status}
              className="w-full"
            >
              {updating ? "Wird aktualisiert..." : "Status speichern"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
