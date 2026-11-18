import { PrismaClient } from '@prisma/client';

// على Vercel كل request بيعمل instance جديدة — الـ global trick بيمنع تراكمهم
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}
