// Prisma Client für Next.js
// Verhindert mehrfache Instanzen in Development (Hot Reload)

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function fixDatabaseUrl(): string {
  const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!rawUrl) {
    console.error("[PRISMA] No DATABASE_URL found!");
    return "";
  }

  // Validate prefix
  if (!rawUrl.startsWith("postgresql://")) {
    console.error("[PRISMA] Invalid DATABASE_URL protocol");
    return "";
  }

  // Try standard URL parsing first
  try {
    const parsed = new URL(rawUrl);
    // Ensure port is valid
    if (parsed.port) {
      const portNum = parseInt(parsed.port, 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        parsed.port = "5432";
      }
    }
    return parsed.toString();
  } catch {
    // URL parsing failed - likely unescaped special chars in password
  }

  // Manual parse: postgresql://user:password@host:port/database
  const match = rawUrl.match(/^postgresql:\/\/([^:]+):(.+)@(.+)$/);
  if (!match) {
    console.error("[PRISMA] Could not parse DATABASE_URL manually");
    return rawUrl;
  }

  const [, user, password, rest] = match;

  // Encode password to handle unescaped special characters (; % @ etc.)
  const encodedPassword = encodeURIComponent(password);

  const fixedUrl = `postgresql://${user}:${encodedPassword}@${rest}`;
  console.log("[PRISMA] Fixed DATABASE_URL encoding");
  return fixedUrl;
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
