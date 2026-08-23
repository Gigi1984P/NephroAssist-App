import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("[TEST-AUTH] Email:", email);
    console.log("[TEST-AUTH] Password length:", password?.length);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("[TEST-AUTH] User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("[TEST-AUTH] User found:", user.email);
    console.log("[TEST-AUTH] Has password:", !!user.password);

    const isValid = await bcrypt.compare(password, user.password || "");
    console.log("[TEST-AUTH] Password valid:", isValid);

    return NextResponse.json({
      userFound: !!user,
      email: user.email,
      hasPassword: !!user.password,
      passwordValid: isValid,
      role: user.role,
    });
  } catch (error) {
    console.error("[TEST-AUTH] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
