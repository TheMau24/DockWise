import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import DriverFlow from "./driver-flow";

const TAKEABLE_TRIP_STATUSES = ["CREADO", "DISPONIBLE", "ASIGNADO"] as const;

export default async function DriverPage() {
  const sessionUser = await getSessionUser();

  const [trucks, trips, docks, driver] = await Promise.all([
    prisma.truck.findMany({
      where: { active: true },
      orderBy: { plate: "asc" },
      include: { transportCompany: true },
    }),
    prisma.trip.findMany({
      where: {
        status: { in: [...TAKEABLE_TRIP_STATUSES] },
        truckId: null,
      },
      orderBy: { date: "asc" },
      include: {
        transportCompany: true,
        origin: true,
        destination: true,
        container: true,
      },
    }),
    prisma.dock.findMany({
      where: {
        active: true,
        yardStatus: "VACIO",
        operationalStatus: "HABILITADO",
      },
      orderBy: { code: "asc" },
    }),
    sessionUser
      ? prisma.driver.findUnique({ where: { userId: sessionUser.id } })
      : Promise.resolve(null),
  ]);

  // Serializar a objetos planos para el client component.
  const trucksData = trucks.map((t) => ({
    id: t.id,
    plate: t.plate,
    type: t.type,
    status: t.status,
    transportCompanyId: t.transportCompanyId,
    companyName: t.transportCompany.name,
    qrCode: t.qrCode,
  }));

  const tripsData = trips.map((t) => ({
    id: t.id,
    code: t.code,
    status: t.status,
    operationType: t.operationType,
    transportCompanyId: t.transportCompanyId,
    companyName: t.transportCompany.name,
    origin: t.origin.name,
    destination: t.destination.name,
    containerCode: t.container?.code ?? null,
  }));

  const docksData = docks.map((d) => ({
    id: d.id,
    code: d.code,
    side: d.side,
    yardStatus: d.yardStatus,
    operationalStatus: d.operationalStatus,
  }));

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <section className="mx-auto max-w-xl space-y-4">
        <Link href="/" className="text-sm font-medium text-slate-600">
          ← Volver al dashboard
        </Link>

        <header className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-5 text-white shadow">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-300">Vista mobile</p>
              <h1 className="text-2xl font-bold">Chofer</h1>
            </div>
            <LogoutButton />
          </div>
          <p className="text-sm text-slate-300">
            Escanea el camión, toma un viaje y selecciona andén al llegar. Los
            cambios se guardan en la base real.
          </p>
        </header>

        <DriverFlow
          trucks={trucksData}
          trips={tripsData}
          docks={docksData}
          driverId={driver?.id ?? null}
        />
      </section>
    </main>
  );
}
