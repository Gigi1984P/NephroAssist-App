import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

function fmtDate(d: string | Date | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-DE"); } catch { return "—"; }
}

export default async function PatientClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!CLINIC_ROLES.includes(session.user.role)) redirect("/dashboard");

  const { id } = await params;

  let patient: any = null;
  try {
    patient = await prisma.patient.findUnique({ where: { id } });
  } catch (e) {
    console.error("Patient fetch failed:", e);
  }

  if (!patient) notFound();

  const name = `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Unbekannt";

  return (
    <div className="p-4">
      <h1>{name}</h1>
      <p>ID: {patient.id}</p>
      <p>Geboren: {fmtDate(patient.dateOfBirth)}</p>
      <p>E-Mail: {patient.email || "—"}</p>
      <Link href="/dashboard/patients" className="btn btn-secondary">Zurück</Link>
    </div>
  );
}
