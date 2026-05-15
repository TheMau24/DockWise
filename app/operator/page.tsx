"use client";

import { useState } from "react";
import Link from "next/link";
import { docks as initialDocks, trips } from "@/lib/mock-data";
import type { Dock, DockOperationalStatus } from "@/types/database";

const operationalStatuses: DockOperationalStatus[] = [
  "Habilitado",
  "Deshabilitado",
  "En carga",
  "En descarga",
  "Disponible para retiro",
  "En mantenimiento",
  "Cerrado temporalmente",
];

export default function OperatorPage() {
  const [docks, setDocks] = useState<Dock[]>(initialDocks);

  function updateDockStatus(dockId: string, status: DockOperationalStatus) {
    setDocks((currentDocks) =>
      currentDocks.map((dock) =>
        dock.id === dockId
          ? {
              ...dock,
              operationalStatus: status,
            }
          : dock
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <section className="mx-auto max-w-5xl space-y-4">
        <Link href="/" className="text-sm font-medium text-slate-600">
          ← Volver al dashboard
        </Link>

        <header className="rounded-2xl bg-slate-950 p-5 text-white shadow">
          <p className="text-sm text-slate-300">Vista operación</p>
          <h1 className="text-2xl font-bold">Control de andenes</h1>
          <p className="mt-2 text-sm text-slate-300">
            Actualiza estados operacionales y revisa viajes asociados.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {docks.map((dock) => {
            const assignedTrip = trips.find(
              (trip) => trip.id === dock.currentTripId
            );

            return (
              <article
                key={dock.id}
                className="rounded-2xl bg-white p-5 shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{dock.code}</h2>
                    <p className="text-sm text-slate-500">Lado {dock.side}</p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                    {dock.yardStatus}
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
                  <p>
                    <strong>Estado operacional:</strong>
                  </p>
                  <p>{dock.operationalStatus}</p>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700">
                    Cambiar estado
                  </label>

                  <select
                    value={dock.operationalStatus}
                    onChange={(event) =>
                      updateDockStatus(
                        dock.id,
                        event.target.value as DockOperationalStatus
                      )
                    }
                    className="mt-2 w-full rounded-xl border bg-white p-3 text-sm"
                  >
                    {operationalStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 rounded-xl border p-3 text-sm">
                  <p className="font-medium">Viaje asociado</p>
                  {assignedTrip ? (
                    <div className="mt-2 text-slate-600">
                      <p>{assignedTrip.code}</p>
                      <p>
                        {assignedTrip.origin} → {assignedTrip.destination}
                      </p>
                      <p>Estado: {assignedTrip.status}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-slate-500">Sin viaje asignado</p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}