import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "NOT_SET";

  // Parse URL to show structure without leaking password
  let parsed: Record<string, string> = {};
  try {
    const url = new URL(rawUrl);
    parsed = {
      protocol: url.protocol,
      username: url.username,
      password: url.password ? "***" : "",
      hostname: url.hostname,
      port: url.port || "(default)",
      pathname: url.pathname,
      search: url.search || "(none)",
    };
  } catch {
    parsed = { error: "Could not parse URL" };
  }

  return NextResponse.json({
    rawUrl,
    parsed,
    env: {
      NODE_ENV: process.env.NODE_ENV || "NOT_SET",
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
    },
  });
}
