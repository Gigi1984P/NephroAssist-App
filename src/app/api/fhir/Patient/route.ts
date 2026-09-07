import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/fhir/Patient
 * Liste aller Patienten als FHIR R4 Patient Resources.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const _count = parseInt(searchParams.get("_count") || "50");
    const _page = parseInt(searchParams.get("_page") || "1");
    const name = searchParams.get("name");

    const where: any = {};
    if (name) {
      where.OR = [
        { firstName: { contains: name, mode: "insensitive" } },
        { lastName: { contains: name, mode: "insensitive" } },
      ];
    }

    const patients = await prisma.patient.findMany({
      where,
      take: _count,
      skip: (_page - 1) * _count,
      orderBy: { lastName: "asc" },
      include: {
        Organization: true,
      },
    });

    const total = await prisma.patient.count({ where });

    const fhirBundle = {
      resourceType: "Bundle",
      type: "searchset",
      total,
      link: [
        {
          relation: "self",
          url: `/api/fhir/Patient?_count=${_count}&_page=${_page}`,
        },
        ...(_page > 1 ? [{ relation: "previous", url: `/api/fhir/Patient?_count=${_count}&_page=${_page - 1}` }] : []),
        ...(total > _page * _count ? [{ relation: "next", url: `/api/fhir/Patient?_count=${_count}&_page=${_page + 1}` }] : []),
      ],
      entry: patients.map((p: any) => ({
        fullUrl: `/api/fhir/Patient/${p.id}`,
        resource: mapToFhirPatient(p),
      })),
    };

    return NextResponse.json(fhirBundle);
  } catch (error) {
    console.error("FHIR Patient Search Error:", error);
    return NextResponse.json(
      { resourceType: "OperationOutcome", issue: [{ severity: "error", code: "processing", diagnostics: "Interner Serverfehler" }] },
      { status: 500 }
    );
  }
}

function mapToFhirPatient(p: any) {
  const fhirPatient: any = {
    resourceType: "Patient",
    id: p.id,
    meta: {
      versionId: "1",
      lastUpdated: p.updatedAt?.toISOString() || p.createdAt?.toISOString(),
      source: "NephroAssist",
    },
    identifier: [
      {
        system: "https://nephroassist.de/patient-id",
        value: p.id,
      },
    ],
    name: [
      {
        use: "official",
        family: p.lastName,
        given: [p.firstName],
      },
    ],
    gender: p.gender?.toLowerCase() || "unknown",
    birthDate: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : undefined,
    telecom: [
      ...(p.email ? [{ system: "email", value: p.email, use: "home" }] : []),
      ...(p.phone ? [{ system: "phone", value: p.phone, use: "home" }] : []),
    ],
    generalPractitioner: p.generalPractitionerName
      ? [
          {
            display: p.generalPractitionerName,
            ...(p.generalPractitionerPhone ? { telecom: [{ system: "phone", value: p.generalPractitionerPhone }] } : {}),
          },
        ]
      : undefined,
    managingOrganization: p.Organization
      ? {
          reference: `Organization/${p.Organization.id}`,
          display: p.Organization.name,
        }
      : undefined,
  };

  if (p.consentStatus || p.transplantType) {
    fhirPatient.extension = [
      ...(p.consentStatus
        ? [
            {
              url: "https://nephroassist.de/fhir/StructureDefinition/patient-consent-status",
              valueString: p.consentStatus,
            },
          ]
        : []),
      ...(p.transplantType
        ? [
            {
              url: "https://nephroassist.de/fhir/StructureDefinition/transplant-type",
              valueString: p.transplantType,
            },
          ]
        : []),
    ];
  }

  return fhirPatient;
}
