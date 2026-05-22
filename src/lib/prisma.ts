// @ts-ignore
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ||
  (new (PrismaClient as any)({
    log: ['query'],
  }));

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
