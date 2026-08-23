import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "NOT_SET";

  // Show raw URL first/last chars to check for quotes
  const firstChars = rawUrl.substring(0, 30);
  const lastChars = rawUrl.substring(rawUrl.length - 10);
  const hasQuotes = rawUrl.startsWith('"') || rawUrl.endsWith('"');

  return NextResponse.json({
    urlLength: rawUrl.length,
    firstChars,
    lastChars,
    hasQuotes,
    env: {
      NODE_ENV: process.env.NODE_ENV || "NOT_SET",
    },
  });
}
