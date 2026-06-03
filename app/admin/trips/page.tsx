import Link from "next/link";
import { revalidatePath } from "next/cache";
import { OperationType, TripStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

async function createTrip(formData: FormData) {
  "use server";

  const code = String(formData.get("code") || "").trim().toUpperCase();
  const status = String(formData.get("status") || "") as TripStatus;
  const operationType = String(formData.get("operationType") || "") as OperationType;
  const dateValue = String(formData.get("date") || "");
  const transportCompanyId = String(formData.get("transportCompanyId") || "");
  const driverId = String(formData.get("driverId") || "");
  const truckId = String(formData.get("truckId") || "");
  const containerId = String(formData.get("containerId") || "");
  const originId = String(formData.get("originId") || "");
  const destinationId = String(formData.get("destinationId") || "");
  const dockId = String(formData.get("dockId") || "");

  if (!code || !status || !operationType || !dateValue || !transportCompanyId || !originId || !destinationId) {
    return;
  }

  const existingTrip = await prisma.trip.findUnique({
    where: { code },
  });

  if (existingTrip) {
    return;
  }

  await prisma.trip.create({
    data: {
      code,
      status,
      operationType,
      date: new Date(dateValue),
      transportCompanyId,
      driverId: driverId || null,
      truckId: truckId || null,
      containerId: containerId || null,
      originId,
      destinationId,
      dockId: dockId || null,
    },
  });

  revalidatePath("/admin/trips");
}

async function updateTripStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const status = String(formData.get("status") || "") as TripStatus;

  if (!id || !status) return;

  await prisma.trip.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/trips");
}

export default async function AdminTripsPage() {
  const [
    trips,
    companies,
    drivers,
    trucks,
    containers,
    origins,
    destinations,
    docks,
  ] = await Promise.all([
    prisma.trip.findMany({
      include: {
        transportCompany: true,
        driver: true,
        truck: true,
        container: true,
        origin: true,
        destination: true,
        dock: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transportCompany.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.driver.findMany({
      where: { active: true },
      include: { transportCompany: true },
      orderBy: { name: "asc" },
    }),
    prisma.truck.findMany({
      where: { active: true },
      include: { transportCompany: true },
      orderBy: { plate: "asc" },
    }),
    prisma.container.findMany({
      where: { active: true },
      orderBy: { code: "asc" },
    }),
    prisma.origin.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.destination.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.dock.findMany({
      where: { active: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="text-sm font-medium text-slate-600">
            ← Volver al panel admin
          </Link>

          <Link href="/admin/masters" className="text-sm font-medium text-slate-600">
            Bases maestras
          </Link>

          <Link href="/admin/masters/operations" className="text-sm font-medium text-slate-600">
            Bases operacionales
          </Link>
        </div>

        <header className="rounded-2xl bg-slate-950 p-6 text-white shadow">
          <p className="text-sm uppercase tracking-wide text-slate-300">
            Administrador
          </p>
          <h1 className="mt-2 text-3xl font-bold">Gestión de viajes</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Crea y administra los viajes operacionales de DockWise usando las bases maestras configuradas.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold text-slate-900">Crear viaje</h2>

            <form action={createTrip} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Código viaje</label>
                <input
                  name="code"
                  required
                  placeholder="Ej: VIAJE-001"
                  className="mt-1 w-full rounded-xl border p-3 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Fecha</label>
                <input
                  name="date"
                  type="date"
                  required
                  className="mt-1 w-full rounded-xl border p-3 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Estado</label>
                <select
                  name="status"
                  required
                  defaultValue={TripStatus.CREADO}
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                >
                  {Object.values(TripStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Tipo operación</label>
                <select
                  name="operationType"
                  required
                  defaultValue={OperationType.DESPACHO}
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                >
                  {Object.values(OperationType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Empresa</label>
                <select
                  name="transportCompanyId"
                  required
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                >
                  <option value="">Selecciona empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Chofer opcional</label>
                <select
                  name="driverId"
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                >
                  <option value="">Sin chofer asignado</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} · {driver.transportCompany.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Camión opcional</label>
                <select
                  name="truckId"
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                >
                  <option value="">Sin camión asignado</option>
                  {trucks.map((truck) => (
                    <option key={truck.id} value={truck.id}>
                      {truck.plate} · {truck.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Contenedor opcional</label>
                <select
                  name="containerId"
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                >
                  <option value="">Sin contenedor</option>
                  {containers.map((container) => (
                    <option key={container.id} value={container.id}>
                      {container.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Origen</label>
                <select
                  name="originId"
                  required
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                >
                  <option value="">Selecciona origen</option>
                  {origins.map((origin) => (
                    <option key={origin.id} value={origin.id}>
                      {origin.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Destino</label>
                <select
                  name="destinationId"
                  required
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                >
                  <option value="">Selecciona destino</option>
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Andén opcional</label>
                <select
                  name="dockId"
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                >
                  <option value="">Sin andén asignado</option>
                  {docks.map((dock) => (
                    <option key={dock.id} value={dock.id}>
                      {dock.code} · {dock.operationalStatus}
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={
                  companies.length === 0 ||
                  origins.length === 0 ||
                  destinations.length === 0
                }
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Crear viaje
              </button>

              {(companies.length === 0 ||
                origins.length === 0 ||
                destinations.length === 0) && (
                <p className="text-xs text-amber-700">
                  Para crear viajes necesitas al menos una empresa, un origen y un destino activos.
                </p>
              )}
            </form>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold text-slate-900">Viajes creados</h2>

            <div className="mt-5 space-y-4">
              {trips.length === 0 ? (
                <p className="text-sm text-slate-500">Aún no hay viajes creados.</p>
              ) : (
                trips.map((trip) => (
                  <div key={trip.id} className="rounded-2xl border p-4 text-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{trip.code}</p>
                        <p className="text-slate-600">
                          {trip.origin.name} → {trip.destination.name}
                        </p>
                        <p className="text-slate-600">
                          Empresa: {trip.transportCompany.name}
                        </p>
                        <p className="text-slate-600">
                          Chofer: {trip.driver?.name || "Sin chofer"}
                        </p>
                        <p className="text-slate-600">
                          Camión: {trip.truck?.plate || "Sin camión"}
                        </p>
                        <p className="text-slate-600">
                          Contenedor: {trip.container?.code || "Sin contenedor"}
                        </p>
                        <p className="text-slate-600">
                          Andén: {trip.dock?.code || "Sin andén"}
                        </p>
                        <p className="text-slate-600">
                          Operación: {trip.operationType}
                        </p>
                        <p className="text-xs text-slate-500">
                          Fecha: {trip.date.toLocaleDateString("es-CL")}
                        </p>
                      </div>

                      <form action={updateTripStatus} className="min-w-[220px] space-y-2">
                        <input type="hidden" name="id" value={trip.id} />

                        <label className="text-xs font-medium text-slate-700">
                          Cambiar estado
                        </label>
                        <select
                          name="status"
                          defaultValue={trip.status}
                          className="w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                        >
                          {Object.values(TripStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <button className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
                          Actualizar
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}