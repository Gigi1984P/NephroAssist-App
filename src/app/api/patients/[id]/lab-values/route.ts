import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testType = searchParams.get("testType");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

    const where: any = { patientId: id };
    if (testType) where.testType = testType;

    const values = await prisma.labValue.findMany({
      where,
      orderBy: { testedAt: "desc" },
      take: limit,
    });

    // Group by testType for charting
    const grouped = values.reduce((acc: Record<string, typeof values>, v) => {
      if (!acc[v.testType]) acc[v.testType] = [];
      acc[v.testType].push(v);
      return acc;
    }, {});

    return NextResponse.json({ values, grouped });
  } catch (error) {
    console.error("Lab values error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { testType, value, unit, referenceLow, referenceHigh, testedAt, notes } = body;

    if (!testType || value === undefined || !unit) {
      return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
    }

    const labValue = await prisma.labValue.create({
      data: {
        patientId: id,
        testType,
        value: parseFloat(value),
        unit,
        referenceLow: referenceLow ? parseFloat(referenceLow) : null,
        referenceHigh: referenceHigh ? parseFloat(referenceHigh) : null,
        testedAt: testedAt ? new Date(testedAt) : new Date(),
        notes,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, labValue });
  } catch (error) {
    console.error("Lab value create error:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}
