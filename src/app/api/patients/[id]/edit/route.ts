import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !CLINIC_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { id } = await params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        Organization: { select: { id: true, name: true } },
        cases: {
          include: { program: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const programs = await prisma.transplantProgram.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      patient: {
        ...patient,
        dateOfBirth: patient.dateOfBirth?.toISOString().split("T")[0] || "",
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString(),
        waitlistedDate: patient.waitlistedDate?.toISOString().split("T")[0] || "",
      },
      organizations,
      programs,
    });
  } catch (error) {
    console.error("Patient edit GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !CLINIC_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      language,
      timezone,
      consentStatus,
      organizationId,
      generalPractitionerName,
      generalPractitionerEmail,
      generalPractitionerPhone,
      generalPractitionerAddress,
      generalPractitionerCity,
      waitlistedDate,
      transplantType,
    } = body;

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        email,
        phone,
        language: language || "de",
        timezone: timezone || "Europe/Berlin",
        consentStatus: consentStatus || "CONSENT_PENDING",
        organizationId: organizationId || null,
        generalPractitionerName,
        generalPractitionerEmail,
        generalPractitionerPhone,
        generalPractitionerAddress,
        generalPractitionerCity,
        waitlistedDate: waitlistedDate ? new Date(waitlistedDate) : null,
        transplantType,
      },
    });

    return NextResponse.json({
      success: true,
      patient: {
        ...updated,
        dateOfBirth: updated.dateOfBirth?.toISOString().split("T")[0] || "",
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Patient edit PUT error:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}
