import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const skip = parseInt(searchParams.get("skip") || "0");
    const action = searchParams.get("action") || undefined;
    const entityType = searchParams.get("entityType") || undefined;

    const where: any = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
        skip,
        include: {
          organization: { select: { name: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, limit, skip });
  } catch (error) {
    console.error("Audit log fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
