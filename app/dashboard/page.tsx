import Link from "next/link";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard operativo
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Vista general del estado diario de viajes, andenes y operación de patio.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Viajes del día"
            value="0"
            description="Viajes registrados en Dockwise"
          />

          <StatCard
            title="Andenes activos"
            value="0"
            description="Andenes disponibles para operación"
          />

          <StatCard
            title="Viajes pendientes"
            value="0"
            description="Movimientos por ejecutar"
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/docks"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Ver estado de andenes
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Revisa qué andenes están disponibles, ocupados o pendientes de gestión.
            </p>
          </Link>

          <Link
            href="/trips"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Ver viajes
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Consulta los viajes creados y su estado operativo.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}