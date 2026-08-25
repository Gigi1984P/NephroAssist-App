import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  GET: Alle Templates (für Klinik)                                 */
/* ================================================================ */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const templates = await prisma.requirementTemplate.findMany({
      include: {
        versions: {
          orderBy: { publishedAt: "desc" },
          take: 5,
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Templates fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

/* ================================================================ */
/*  POST: Neues Template erstellen                                   */
/* ================================================================ */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.object({
      name: z.string().min(1, "Name erforderlich"),
      category: z.string().min(1, "Kategorie erforderlich"),
      description: z.string().optional(),
      required: z.boolean().default(true),
      listingBlocker: z.boolean().default(false),
      patientFriendlyDescription: z.string().optional(),
      validityDuration: z.number().optional(),
      renewalLeadTime: z.number().optional(),
    });

    const data = schema.parse(body);

    // Program ID holen (wir nehmen das erste verfügbare Programm)
    const program = await prisma.transplantProgram.findFirst({
      select: { id: true, organizationId: true },
    });

    if (!program) {
      return NextResponse.json({ error: "Kein Programm gefunden" }, { status: 400 });
    }

    const template = await prisma.requirementTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description || null,
        required: data.required,
        listingBlocker: data.listingBlocker,
        patientFriendlyDescription: data.patientFriendlyDescription || null,
        programId: program.id,
        organizationId: program.organizationId,
        responsibleRole: "PATIENT",
        reviewRequired: true,
        validityDuration: data.validityDuration || null,
        renewalLeadTime: data.renewalLeadTime || null,
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Template create error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
