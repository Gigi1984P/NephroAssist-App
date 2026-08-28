import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/translations?lang=de&category=patient
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "de";
    const category = searchParams.get("category");

    const where: any = { language: lang };
    if (category) where.category = category;

    const translations = await prisma.translation.findMany({ where });

    // Als key-value Objekt zurückgeben
    const dict: Record<string, string> = {};
    for (const t of translations) {
      dict[t.key] = t.value;
    }

    return NextResponse.json({ lang, translations: dict });
  } catch (error) {
    console.error("Translations GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

// POST /api/translations (nur ADMIN)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body = await request.json();
    const { key, language, value, category = "general" } = body;

    if (!key || !language || !value) {
      return NextResponse.json({ error: "key, language und value erforderlich" }, { status: 400 });
    }

    const translation = await prisma.translation.upsert({
      where: { key_language: { key, language } },
      create: { key, language, value, category },
      update: { value, category },
    });

    return NextResponse.json({ translation });
  } catch (error) {
    console.error("Translations POST error:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}

// DELETE /api/translations (nur ADMIN)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const language = searchParams.get("language");

    if (!key || !language) {
      return NextResponse.json({ error: "key und language erforderlich" }, { status: 400 });
    }

    await prisma.translation.delete({
      where: { key_language: { key, language } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Translations DELETE error:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
