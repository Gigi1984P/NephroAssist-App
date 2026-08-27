import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    console.log("[DEBUG] Session:", session ? "Vorhanden" : "NULL");
    console.log("[DEBUG] User:", session?.user);

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert", debug: "Session ist null" }, { status: 401 });
    }

    return NextResponse.json({
      status: "OK",
      session: {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
    });
  } catch (e) {
    console.error("[DEBUG] Auth error:", e);
    return NextResponse.json({ error: "Auth Fehler", details: String(e) }, { status: 500 });
  }
}
