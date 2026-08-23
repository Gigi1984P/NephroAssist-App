// Prisma Client für Next.js
// Verhindert mehrfache Instanzen in Development (Hot Reload)
// Verzögert Produktiv-Initialisierung bis zur ersten Verwendung

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient({
      log: ["error"],
    });
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
