import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    console.log("[DEBUG-LOGIN] Raw body:", body);

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = null;
    }

    return NextResponse.json({
      received: {
        body: body,
        parsed: parsed,
        headers: Object.fromEntries(request.headers.entries()),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
