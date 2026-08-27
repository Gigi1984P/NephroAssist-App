import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, getPatientWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let result = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

/* ================================================================ */
/*  POST: Neuen Patienten anlegen + optional User-Account            */
/* ================================================================ */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];
    if (!clinicRoles.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      gpName,
      gpEmail,
      gpPhone,
      createUserAccount,
      userEmail,
    } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: "Vor- und Nachname sind Pflicht" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    });

    // User-Account erstellen falls gewünscht
    let createdUserId: string | null = null;
    let generatedPassword = "";
    let finalUserEmail = "";

    if (createUserAccount) {
      const targetEmail = userEmail?.trim() || email?.trim();
      if (!targetEmail) {
        return NextResponse.json({ error: "E-Mail ist Pflicht für User-Account" }, { status: 400 });
      }

      // Prüfen ob E-Mail bereits existiert
      const existingUser = await prisma.user.findUnique({
        where: { email: targetEmail.toLowerCase() },
      });
      if (existingUser) {
        return NextResponse.json({ error: "E-Mail bereits vergeben" }, { status: 400 });
      }

      generatedPassword = generatePassword(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, 12);

      const newUser = await prisma.user.create({
        data: {
          email: targetEmail.toLowerCase(),
          name: `${firstName.trim()} ${lastName.trim()}`,
          password: hashedPassword,
          role: "PATIENT",
        },
      });
      createdUserId = newUser.id;
      finalUserEmail = targetEmail.toLowerCase();

      // E-Mail senden
      if (finalUserEmail && generatedPassword) {
        const emailPayload = getPatientWelcomeEmail(
          firstName.trim(),
          finalUserEmail,
          generatedPassword,
          dbUser?.name || undefined
        );
        await sendEmail({
          to: finalUserEmail,
          subject: emailPayload.subject,
          html: emailPayload.html,
          text: emailPayload.text,
        });
      }
    }

    const patient = await prisma.patient.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date("1990-01-01"),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        generalPractitionerName: gpName?.trim() || null,
        generalPractitionerEmail: gpEmail?.trim() || null,
        generalPractitionerPhone: gpPhone?.trim() || null,
        createdBy: user.id,
        userId: createdUserId,
      },
    });

    // ─── Auto-Zuweisung: PatientCase + alle Untersuchungen ────────────────
    let assignedRequirements = 0;
    try {
      // 1. Erste Organisation finden
      const org = await prisma.organization.findFirst({ select: { id: true } });
      if (!org) {
        console.warn("Keine Organisation gefunden, Auto-Zuweisung übersprungen");
      } else {
        // 2. Erstes Programm finden
        const prog = await prisma.transplantProgram.findFirst({ select: { id: true } });
        if (!prog) {
          console.warn("Kein Programm gefunden, Auto-Zuweisung übersprungen");
        } else {
          // 3. PatientCase erstellen
          const patientCase = await prisma.patientCase.create({
            data: {
              patientId: patient.id,
              organizationId: org.id,
              programId: prog.id,
              status: "REFERRAL",
              coordinatorId: user.id,
            },
          });

          // 4. Alle aktiven RequirementTemplates finden
          const templates = await prisma.requirementTemplate.findMany({
            where: { status: "PUBLISHED" },
          });

          // 5. Für jedes Template: PatientRequirement + Workflow-Tasks
          for (const template of templates) {
            let expiresAt: Date | undefined;
            if (template.validityDuration) {
              expiresAt = new Date();
              expiresAt.setMonth(expiresAt.getMonth() + template.validityDuration);
            }

            const patientReq = await prisma.patientRequirement.create({
              data: {
                caseId: patientCase.id,
                templateId: template.id,
                organizationId: org.id,
                programId: prog.id,
                title: template.name,
                category: template.category,
                description: template.description || null,
                required: template.required,
                listingBlocker: template.listingBlocker,
                responsibleRole: "PATIENT",
                reviewRequired: true,
                validityDuration: template.validityDuration,
                renewalLeadTime: template.renewalLeadTime,
                patientFriendlyDescription: template.patientFriendlyDescription || null,
                status: "NOT_STARTED",
                priority: template.listingBlocker ? 10 : 5,
                ...(expiresAt ? { expiresAt } : {}),
              },
            });

            // 5-Schritte-Workflow
            const workflowSteps = [
              { stepNumber: 1, title: "Überweisung einholen", desc: "Hausarzt-Überweisung anfordern", owner: "PATIENT" as const },
              { stepNumber: 2, title: "Termin vereinbaren", desc: "Facharzt-Termin vereinbaren", owner: "PATIENT" as const },
              { stepNumber: 3, title: "Befund/Bericht hochladen", desc: "Dokumente hochladen", owner: "PATIENT" as const },
              { stepNumber: 4, title: "Dokument prüfen", desc: "Prüfung durch Klinik", owner: "TRANSPLANT_CENTER" as const },
              { stepNumber: 5, title: "Freigabe durch Transplantationszentrum", desc: "Abschluss und Freigabe", owner: "TRANSPLANT_CENTER" as const },
            ];

            for (const step of workflowSteps) {
              await prisma.task.create({
                data: {
                  requirementId: patientReq.id,
                  caseId: patientCase.id,
                  patientId: patient.id,
                  title: step.title,
                  description: step.desc,
                  ownerType: step.owner,
                  status: step.stepNumber === 1 ? "IN_PROGRESS" : "PENDING",
                  isWorkflowStep: true,
                  stepNumber: step.stepNumber,
                  stepName: step.title,
                  stepDescription: step.desc,
                  dueDate: expiresAt,
                },
              });
            }
            assignedRequirements++;
          }
        }
      }
    } catch (autoAssignError) {
      console.error("Auto-Zuweisung fehlgeschlagen:", autoAssignError);
    }

    return NextResponse.json({
      patient,
      userCreated: !!createdUserId,
      userEmail: finalUserEmail || null,
      password: generatedPassword || null,
      assignedRequirements,
    }, { status: 201 });
  } catch (error) {
    console.error("Patient create error:", error);
    return NextResponse.json({ error: "Fehler beim Anlegen" }, { status: 500 });
  }
}
