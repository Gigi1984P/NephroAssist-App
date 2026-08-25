import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;

    // Patient: eigene PatientRequirements
    if (user.role === "PATIENT") {
      const patient = await prisma.patient.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!patient) {
        return NextResponse.json({ requirements: [] });
      }

      const requirements = await prisma.patientRequirement.findMany({
        where: { patientCase: { patientId: patient.id } },
        orderBy: [
          { priority: "desc" },
          { status: "asc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
        include: {
          template: {
            select: {
              name: true,
              category: true,
              required: true,
              listingBlocker: true,
              patientFriendlyDescription: true,
            },
          },
          patientCase: {
            select: {
              patient: { select: { firstName: true, lastName: true } },
            },
          },
          tasks: {
            select: { id: true, title: true, status: true, dueDate: true },
            orderBy: { dueDate: "asc" },
            take: 3,
          },
        },
      });

      return NextResponse.json({ requirements });
    }

    // Caregiver: PatientRequirements der zugewiesenen Patienten
    if (user.role === "CAREGIVER") {
      const accesses = await prisma.caregiverAccess.findMany({
        where: { caregiverId: user.id, status: "ACTIVE" },
        select: { patientId: true },
      });
      const patientIds = accesses.map((a) => a.patientId);
      if (patientIds.length === 0) {
        return NextResponse.json({ requirements: [] });
      }

      const requirements = await prisma.patientRequirement.findMany({
        where: { patientCase: { patientId: { in: patientIds } } },
        orderBy: [
          { priority: "desc" },
          { status: "asc" },
          { dueDate: "asc" },
        ],
        include: {
          template: {
            select: {
              name: true,
              category: true,
              required: true,
              listingBlocker: true,
              patientFriendlyDescription: true,
            },
          },
          patientCase: {
            select: {
              patient: { select: { firstName: true, lastName: true } },
            },
          },
          tasks: {
            select: { id: true, title: true, status: true, dueDate: true },
            orderBy: { dueDate: "asc" },
            take: 3,
          },
        },
      });

      return NextResponse.json({ requirements });
    }

    // Klinik-Rollen: alle PatientRequirements (falls direkt zugegriffen)
    const requirements = await prisma.patientRequirement.findMany({
      orderBy: [
        { priority: "desc" },
        { status: "asc" },
        { dueDate: "asc" },
      ],
      take: 100,
      include: {
        template: {
          select: {
            name: true,
            category: true,
            required: true,
            listingBlocker: true,
            patientFriendlyDescription: true,
          },
        },
        patientCase: {
          select: {
            patient: { select: { firstName: true, lastName: true } },
          },
        },
        tasks: {
          select: { id: true, title: true, status: true, dueDate: true },
          orderBy: { dueDate: "asc" },
          take: 3,
        },
      },
    });

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error("PatientRequirements fetch error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Anforderungen" },
      { status: 500 }
    );
  }
}
