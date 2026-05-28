import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting DockWise minimal seed...");

  await prisma.user.upsert({
    where: { email: "admin@dockwise.cl" },
    update: {
      name: "Administrador DockWise",
      role: "ADMIN",
      active: true,
    },
    create: {
      name: "Administrador DockWise",
      email: "admin@dockwise.cl",
      role: "ADMIN",
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "operador@dockwise.cl" },
    update: {
      name: "Operador DockWise",
      role: "OPERATOR",
      active: true,
    },
    create: {
      name: "Operador DockWise",
      email: "operador@dockwise.cl",
      role: "OPERATOR",
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "chofer@dockwise.cl" },
    update: {
      name: "Chofer DockWise",
      role: "DRIVER",
      active: true,
    },
    create: {
      name: "Chofer DockWise",
      email: "chofer@dockwise.cl",
      role: "DRIVER",
      active: true,
    },
  });

  console.log("DockWise minimal seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });