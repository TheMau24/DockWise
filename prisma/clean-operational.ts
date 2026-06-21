import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  console.log("Limpiando datos operacionales de DockWise...");
  console.log("(Se conservan los usuarios / login)\n");

  // Orden respetando las llaves foráneas (de hijos a padres).
  const changeLogs = await prisma.changeLog.deleteMany();
  const trips = await prisma.trip.deleteMany();
  const drivers = await prisma.driver.deleteMany();
  const trucks = await prisma.truck.deleteMany();
  const containers = await prisma.container.deleteMany();
  const docks = await prisma.dock.deleteMany();
  const origins = await prisma.origin.deleteMany();
  const destinations = await prisma.destination.deleteMany();
  const companies = await prisma.transportCompany.deleteMany();

  const remainingUsers = await prisma.user.count();

  console.log("Eliminados:");
  console.log(`  Historial (ChangeLog): ${changeLogs.count}`);
  console.log(`  Viajes:                ${trips.count}`);
  console.log(`  Choferes:              ${drivers.count}`);
  console.log(`  Camiones:              ${trucks.count}`);
  console.log(`  Contenedores:          ${containers.count}`);
  console.log(`  Andenes:               ${docks.count}`);
  console.log(`  Orígenes:              ${origins.count}`);
  console.log(`  Destinos:              ${destinations.count}`);
  console.log(`  Empresas:              ${companies.count}`);
  console.log(`\nUsuarios conservados:    ${remainingUsers}`);
  console.log("\nBase operacional limpia. Lista para datos reales.");
}

main()
  .catch((error) => {
    console.error("clean-operational falló:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
