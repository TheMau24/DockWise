import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, roleHome } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function HomePage() {
  const sessionUser = await requireUser();

  // El dashboard general es solo para ADMIN. Operador y chofer van a su vista.
  if (sessionUser.role !== "ADMIN") {
    redirect(roleHome(sessionUser.role));
  }

  const [users, companies, trucks, docks, trips, recentTrips] =
    await Promise.all([
      prisma.user.count(),
      prisma.transportCompany.count(),
      prisma.truck.count(),
      prisma.dock.count(),
      prisma.trip.count(),
      prisma.trip.findMany({
        take: 6,
        include: {
          transportCompany: true,
          driver: true,
          truck: true,
          container: true,
          origin: true,
          destination: true,
          dock: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

  const activeTrips = await prisma.trip.count({
    where: {
      status: {
        notIn: ["FINALIZADO", "CANCELADO"],
      },
    },
  });

  const availableTrucks = await prisma.truck.count({
    where: {
      active: true,
      status: "DISPONIBLE",
    },
  });

  const occupiedDocks = await prisma.dock.count({
    where: {
      active: true,
      yardStatus: {
        not: "VACIO",
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-6 text-white shadow md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-300">
              Plataforma logística
            </p>
            <h1 className="mt-2 text-3xl font-bold">DockWise</h1>
            <p className="mt-2 max-w-3xl text-slate-300">
              Control operativo de viajes, camiones, choferes, contenedores,
              andenes y estado del patio.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <p className="text-sm text-slate-300">
              {sessionUser.name} · {sessionUser.role}
            </p>
            <LogoutButton />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Viajes activos</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {activeTrips}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Camiones disponibles</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {availableTrucks}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Andenes ocupados/bloqueados</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {occupiedDocks}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Viajes totales</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{trips}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Link
            href="/admin"
            className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              Administrador
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Configura bases maestras, viajes y recursos.
            </p>
          </Link>

          <Link
            href="/driver"
            className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              Vista Chofer
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Escaneo QR, viajes disponibles y selección de andén.
            </p>
          </Link>

          <Link
            href="/operator"
            className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              Vista Operador
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Control de andenes, estados y operaciones.
            </p>
          </Link>

          <div className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold text-slate-900">
              Base real Supabase
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Usuarios: {users} · Empresas: {companies} · Camiones: {trucks} ·
              Andenes: {docks}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Últimos viajes creados
              </h2>
              <p className="text-sm text-slate-500">
                Datos reales desde Supabase / Prisma.
              </p>
            </div>

            <Link
              href="/admin/trips"
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Crear viaje
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            {recentTrips.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aún no hay viajes creados. Crea el primero desde Gestión de
                viajes.
              </p>
            ) : (
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-3">Viaje</th>
                    <th className="p-3">Origen</th>
                    <th className="p-3">Destino</th>
                    <th className="p-3">Empresa</th>
                    <th className="p-3">Camión</th>
                    <th className="p-3">Chofer</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Operación</th>
                  </tr>
                </thead>

                <tbody>
                  {recentTrips.map((trip) => (
                    <tr key={trip.id} className="border-b">
                      <td className="p-3 font-medium text-slate-900">
                        {trip.code}
                      </td>
                      <td className="p-3 text-slate-700">
                        {trip.origin.name}
                      </td>
                      <td className="p-3 text-slate-700">
                        {trip.destination.name}
                      </td>
                      <td className="p-3 text-slate-700">
                        {trip.transportCompany.name}
                      </td>
                      <td className="p-3 text-slate-700">
                        {trip.truck?.plate || "Sin camión"}
                      </td>
                      <td className="p-3 text-slate-700">
                        {trip.driver?.name || "Sin chofer"}
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {trip.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">
                        {trip.operationType}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}