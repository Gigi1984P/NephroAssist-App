// Prisma Client für Next.js
// Verhindert mehrfache Instanzen in Development (Hot Reload)

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function fixDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!url) {
    console.error("[PRISMA] No DATABASE_URL found!");
    return "";
  }

  // Validate that URL starts with postgresql://
  if (!url.startsWith("postgresql://")) {
    console.error("[PRISMA] Invalid DATABASE_URL protocol");
    return "";
  }

  try {
    const parsed = new URL(url);
    // Ensure port is a valid number
    if (parsed.port) {
      const portNum = parseInt(parsed.port, 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        console.error("[PRISMA] Invalid port in DATABASE_URL, using default 5432");
        parsed.port = "5432";
      }
    }
    return parsed.toString();
  } catch {
    // If URL parsing fails, return as-is and let Prisma handle it
    console.error("[PRISMA] URL parsing failed, returning raw string");
    return url;
  }
}

function getPrisma(): PrismaClient {
  const databaseUrl = fixDatabaseUrl();

  const config: ConstructorParameters<typeof PrismaClient>[0] = {
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
  };

  if (databaseUrl) {
    config.datasources = {
      db: {
        url: databaseUrl,
      },
    };
  }

  if (process.env.NODE_ENV === "production") {
    return new PrismaClient(config);
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient(config);
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
