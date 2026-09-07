import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: List emails for current user (inbox + sent)                 */
/* ================================================================ */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "all"; // all, inbox, sent, drafts
    const patientId = searchParams.get("patientId") || undefined;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        patients: { select: { id: true } },
      },
    });

    const userEmail = dbUser?.email || "";
    const patientIds = dbUser?.patients.map((p) => p.id) || [];

    const where: any = {};

    if (folder === "inbox") {
      where.toEmail = userEmail;
      where.status = "SENT";
    } else if (folder === "sent") {
      where.createdBy = user.id;
      where.status = "SENT";
    } else if (folder === "drafts") {
      where.createdBy = user.id;
      where.status = "DRAFT";
    } else {
      // all: emails sent to user's email OR sent by user
      where.OR = [
        { toEmail: userEmail, status: "SENT" },
        { createdBy: user.id },
      ];
    }

    if (patientId) {
      where.patientId = patientId;
    }

    // Clinic users: also scope by organization
    const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];
    if (clinicRoles.includes(user.role)) {
      const membership = await prisma.organizationMembership.findFirst({
        where: { userId: user.id },
        select: { organizationId: true },
      });
      if (membership) {
        where.organizationId = membership.organizationId;
      }
    } else if (user.role === "PATIENT" || user.role === "CAREGIVER") {
      where.patientId = { in: patientIds };
    }

    const emails = await prisma.emailMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        attachments: true,
      },
      take: 200,
    });

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Get emails error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der E-Mails" },
      { status: 500 }
    );
  }
}

/* ================================================================ */
/*  POST: Create a draft email                                       */
/* ================================================================ */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();
    const {
      to,
      cc,
      bcc,
      subject,
      body: emailBody,
      htmlBody,
      patientId,
      caseId,
    } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { error: "Empfänger und Betreff sind Pflicht" },
        { status: 400 }
      );
    }

    // Determine organization
    let organizationId: string | null = null;
    const membership = await prisma.organizationMembership.findFirst({
      where: { userId: user.id },
      select: { organizationId: true },
    });
    if (membership) {
      organizationId = membership.organizationId;
    } else if (patientId) {
      const patientCase = await prisma.patientCase.findFirst({
        where: { patientId },
        select: { organizationId: true },
      });
      if (patientCase) organizationId = patientCase.organizationId;
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: "Keine Organisation gefunden" },
        { status: 400 }
      );
    }

    const email = await prisma.emailMessage.create({
      data: {
        fromEmail: user.email || "",
        toEmail: to,
        ccEmail: cc || null,
        bccEmail: bcc || null,
        subject,
        body: emailBody || "",
        htmlBody: htmlBody || null,
        status: "DRAFT",
        createdBy: user.id,
        patientId: patientId || null,
        caseId: caseId || null,
        organizationId,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        attachments: true,
      },
    });

    return NextResponse.json({ email });
  } catch (error) {
    console.error("Create draft error:", error);
    return NextResponse.json(
      { error: "Fehler beim Speichern des Entwurfs" },
      { status: 500 }
    );
  }
}
