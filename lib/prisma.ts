import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

// max: 1 evita que cada función serverless de Vercel abra múltiples conexiones
// y agote el pooler de Supabase (EMAXCONNSESSION). Combinar con el Transaction
// Pooler (puerto 6543) en producción.
const adapter = new PrismaPg({
  connectionString,
  max: 1,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}