import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    console.log("[DEBUG-LOGIN] Body:", body);

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = null;
    }

    console.log("[DEBUG-LOGIN] Parsed:", JSON.stringify(parsed));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      rawBody: body,
      parsed: parsed,
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
      method: request.method,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
