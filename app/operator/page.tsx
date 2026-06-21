import Link from "next/link";
import { revalidatePath } from "next/cache";
import { DockOperationalStatus, DockYardStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

const FINISHED_TRIP_STATUSES = ["FINALIZADO", "CANCELADO"] as const;

async function updateDockStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const operationalStatus = String(
    formData.get("operationalStatus") || ""
  ) as DockOperationalStatus;
  const yardStatus = String(formData.get("yardStatus") || "") as DockYardStatus;

  if (!id || !operationalStatus || !yardStatus) return;

  const current = await prisma.dock.findUnique({ where: { id } });
  if (!current) return;

  await prisma.dock.update({
    where: { id },
    data: { operationalStatus, yardStatus },
  });

  // Registrar el cambio en el historial.
  const user = await getSessionUser();
  await prisma.changeLog.create({
    data: {
      entityName: "Dock",
      entityId: id,
      action: "UPDATE_STATUS",
      oldValue: {
        operationalStatus: current.operationalStatus,
        yardStatus: current.yardStatus,
      },
      newValue: { operationalStatus, yardStatus },
      userId: user?.id ?? null,
    },
  });

  revalidatePath("/operator");
}

export default async function OperatorPage() {
  const docks = await prisma.dock.findMany({
    where: { active: true },
    orderBy: { code: "asc" },
    include: {
      trips: {
        where: { status: { notIn: [...FINISHED_TRIP_STATUSES] } },
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          origin: true,
          destination: true,
          truck: true,
          driver: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-6xl space-y-4">
        <Link href="/" className="text-sm font-medium text-slate-600">
          ← Volver al dashboard
        </Link>

        <header className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-5 text-white shadow md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-300">Vista operación</p>
            <h1 className="text-2xl font-bold">Control de andenes</h1>
            <p className="mt-2 text-sm text-slate-300">
              Actualiza estados operacionales y de patio. Los cambios se guardan
              en la base y quedan registrados en el historial.
            </p>
          </div>
          <LogoutButton />
        </header>

        {docks.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow">
            No hay andenes activos. Créalos en{" "}
            <Link href="/admin/masters" className="font-medium text-slate-700">
              Bases maestras
            </Link>
            .
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {docks.map((dock) => {
              const trip = dock.trips[0];

              return (
                <article key={dock.id} className="rounded-2xl bg-white p-5 shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {dock.code}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {dock.side || "Sin sector"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {dock.yardStatus}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
                    <p className="font-medium text-slate-700">
                      Estado operacional
                    </p>
                    <p className="text-slate-600">{dock.operationalStatus}</p>
                  </div>

                  <form action={updateDockStatus} className="mt-4 space-y-3">
                    <input type="hidden" name="id" value={dock.id} />

                    <div>
                      <label className="text-xs font-medium text-slate-700">
                        Estado operacional
                      </label>
                      <select
                        name="operationalStatus"
                        defaultValue={dock.operationalStatus}
                        className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                      >
                        {Object.values(DockOperationalStatus).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700">
                        Estado patio
                      </label>
                      <select
                        name="yardStatus"
                        defaultValue={dock.yardStatus}
                        className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900"
                      >
                        {Object.values(DockYardStatus).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                      Guardar cambios
                    </button>
                  </form>

                  <div className="mt-4 rounded-xl border p-3 text-sm">
                    <p className="font-medium text-slate-700">Viaje asociado</p>
                    {trip ? (
                      <div className="mt-2 text-slate-600">
                        <p className="font-semibold text-slate-900">
                          {trip.code}
                        </p>
                        <p>
                          {trip.origin.name} → {trip.destination.name}
                        </p>
                        <p>Camión: {trip.truck?.plate || "Sin camión"}</p>
                        <p>Chofer: {trip.driver?.name || "Sin chofer"}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Estado: {trip.status}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-slate-500">Sin viaje asignado</p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}
