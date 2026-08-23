import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "NOT_SET";

  // Show URL structure without revealing password
  let analysis: Record<string, any> = {};

  // Try to manually parse the URL
  const urlRegex = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const match = rawUrl.match(urlRegex);

  if (match) {
    const [, user, pass, host, port, db] = match;
    analysis = {
      matchType: "regex",
      user,
      passwordLength: pass.length,
      passwordHasSpecial: /[^a-zA-Z0-9]/.test(pass),
      passwordNeedsEncoding: /[:@#&?%=\/\\]/.test(pass),
      host,
      port,
      portNumber: parseInt(port, 10),
      database: db,
    };
  } else {
    // Try with URL constructor
    try {
      const url = new URL(rawUrl);
      analysis = {
        matchType: "URL constructor",
        protocol: url.protocol,
        user: url.username,
        host: url.hostname,
        port: url.port,
        database: url.pathname?.substring(1),
      };
    } catch (e) {
      analysis = {
        matchType: "none",
        error: e instanceof Error ? e.message : String(e),
        length: rawUrl.length,
        startsWith: rawUrl.substring(0, 20),
        endsWith: rawUrl.substring(rawUrl.length - 20),
      };
    }
  }

  return NextResponse.json({
    analysis,
    env: {
      NODE_ENV: process.env.NODE_ENV || "NOT_SET",
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
    },
  });
}
