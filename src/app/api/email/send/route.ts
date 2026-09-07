import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, sanitizeHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  POST: Send an email via SMTP                                     */
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

    // Send via SMTP using existing helper
    const result = await sendEmail({
      to,
      subject,
      html: sanitizeHtml(htmlBody || emailBody || ""),
      text: emailBody || undefined,
    });

    const status = result.success ? "SENT" : "FAILED";

    const email = await prisma.emailMessage.create({
      data: {
        fromEmail: user.email || "",
        toEmail: to,
        ccEmail: cc || null,
        bccEmail: bcc || null,
        subject,
        body: emailBody || "",
        htmlBody: htmlBody || null,
        status,
        sentAt: status === "SENT" ? new Date() : null,
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

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "E-Mail-Versand fehlgeschlagen", email },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Fehler beim Senden der E-Mail" },
      { status: 500 }
    );
  }
}
