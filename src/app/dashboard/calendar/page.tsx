"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

interface Appointment {
  id: string;
  type: string;
  startTime: string;
  endTime?: string | null;
  location?: string | null;
  patient?: {
    firstName: string;
    lastName: string;
  } | null;
  status: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kalender</h2>
          <p className="text-slate-600">Alle Termine im Überblick</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Termin
        </Button>
      </div>

      <div className="rounded-lg border bg-white shadow">
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <CalendarIcon className="h-12 w-12 mb-4" />
              <p>Lade Termine...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <Plus className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Keine Termine gefunden</p>
              <p className="text-sm">Erstellen Sie Ihren ersten Termin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{apt.type}</p>
                      {apt.patient && (
                        <p className="text-sm text-slate-600">
                          {apt.patient.firstName} {apt.patient.lastName}
                        </p>
                      )}
                      <p className="text-sm text-slate-600">
                        {new Date(apt.startTime).toLocaleDateString("de-DE", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {apt.location && (
                        <p className="text-sm text-slate-600">{apt.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apt.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : apt.status === "PLANNED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {apt.status === "CONFIRMED"
                        ? "Bestätigt"
                        : apt.status === "PLANNED"
                        ? "Geplant"
                        : "Storniert"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
