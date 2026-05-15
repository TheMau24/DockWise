import Link from "next/link";
import { docks, trips, trucks } from "@/lib/mock-data";

export default function HomePage() {
  const activeTrips = trips.filter((trip) => trip.status !== "Finalizado").length;
  const occupiedDocks = docks.filter((dock) => dock.yardStatus !== "Vacío").length;
  const availableTrucks = trucks.filter((truck) => truck.status === "Disponible").length;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-slate-950 p-6 text-white shadow">
          <p className="text-sm uppercase tracking-wide text-slate-300">
            Plataforma logística
          </p>
          <h1 className="mt-2 text-3xl font-bold">DockWise</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Control operativo de viajes, camiones, choferes, contenedores, andenes
            y estado del patio.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Viajes activos</p>
            <p className="mt-2 text-3xl font-bold">{activeTrips}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Andenes ocupados / bloqueados</p>
            <p className="mt-2 text-3xl font-bold">{occupiedDocks}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Camiones disponibles</p>
            <p className="mt-2 text-3xl font-bold">{availableTrucks}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            href="/driver"
            className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold">Vista Chofer</h2>
            <p className="mt-2 text-sm text-slate-600">
              Simulación de escaneo QR, toma de viaje y selección de andén.
            </p>
          </Link>

          <Link
            href="/operator"
            className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold">Vista Operador</h2>
            <p className="mt-2 text-sm text-slate-600">
              Control rápido de andenes, estados operacionales y viajes.
            </p>
          </Link>

          <div className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Vista Admin</h2>
            <p className="mt-2 text-sm text-slate-600">
              Próximo módulo: CRUD de camiones, andenes y viajes.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-semibold">Viajes del día</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-600">
                  <th className="p-3">Viaje</th>
                  <th className="p-3">Origen</th>
                  <th className="p-3">Destino</th>
                  <th className="p-3">Vehículo</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Operación</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id} className="border-b">
                    <td className="p-3 font-medium">{trip.code}</td>
                    <td className="p-3">{trip.origin}</td>
                    <td className="p-3">{trip.destination}</td>
                    <td className="p-3">{trip.vehicleTypeRequired}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                        {trip.status}
                      </span>
                    </td>
                    <td className="p-3">{trip.operationType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}