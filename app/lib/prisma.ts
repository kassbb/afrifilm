import { PrismaClient } from "@prisma/client";

// Éviter d'instancier trop de fois PrismaClient pendant le développement
// Use this approach to avoid too many instances of PrismaClient in development

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
