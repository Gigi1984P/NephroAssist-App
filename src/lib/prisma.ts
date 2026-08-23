// Prisma Client mit Lazy Initialization
// Verhindert, dass Prisma zur Build-Zeit initialisiert wird

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient()
  }
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  
  return globalForPrisma.prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    return client[prop as keyof PrismaClient]
  },
})
