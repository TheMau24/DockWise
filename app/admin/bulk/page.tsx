import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ENTITIES, ENTITY_KEYS, type EntityKey } from "./entities";
import BulkImporter from "./bulk-importer";

export const metadata = {
  title: "Carga masiva · DockWise",
};

export default async function BulkUploadPage() {
  const [
    mandantes,
    companies,
    trucks,
    docks,
    containers,
    origins,
    destinations,
    drivers,
  ] = await Promise.all([
    prisma.mandante.count(),
    prisma.transportCompany.count(),
    prisma.truck.count(),
    prisma.dock.count(),
    prisma.container.count(),
    prisma.origin.count(),
    prisma.destination.count(),
    prisma.driver.count(),
  ]);

  const counts: Record<EntityKey, number> = {
    mandantes,
    companies,
    trucks,
    docks,
    containers,
    origins,
    destinations,
    drivers,
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <Link href="/admin" className="text-sm font-medium text-slate-600">
          ← Volver al panel administrador
        </Link>

        <header className="rounded-2xl bg-slate-950 p-6 text-white shadow">
          <p className="text-sm uppercase tracking-wide text-slate-300">
            Administrador
          </p>
          <h1 className="mt-2 text-3xl font-bold">Carga masiva</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Importa tus bases desde archivos CSV. Descarga la plantilla de cada
            entidad, complétala y súbela. Las filas duplicadas (por código,
            patente, RUT o nombre) se omiten automáticamente.
          </p>
          <p className="mt-3 max-w-3xl rounded-xl bg-white/10 p-3 text-xs text-slate-200">
            Orden recomendado: primero <strong>Empresas</strong>, luego{" "}
            <strong>Camiones</strong> y <strong>Choferes</strong> (que referencian
            una empresa por nombre). Andenes, contenedores, orígenes y destinos
            son independientes.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {ENTITY_KEYS.map((key) => (
            <BulkImporter
              key={key}
              entityKey={key}
              label={ENTITIES[key].label}
              description={ENTITIES[key].description}
              headers={ENTITIES[key].headers}
              count={counts[key]}
            />
          ))}
        </section>
      </section>
    </main>
  );
}
