import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-5xl space-y-6">
        <Link href="/" className="text-sm font-medium text-slate-600">
          ← Volver al dashboard
        </Link>

        <header className="rounded-2xl bg-slate-950 p-6 text-white shadow">
          <p className="text-sm uppercase tracking-wide text-slate-300">
            Administrador
          </p>
          <h1 className="mt-2 text-3xl font-bold">Panel administrador</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Configuración general de DockWise.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/masters"
            className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              Bases maestras
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Crear y mantener empresas, camiones y andenes.
            </p>
          </Link>

          <Link
            href="/admin/masters/operations"
            className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              Bases operacionales
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Crear y mantener orígenes, destinos, contenedores y choferes.
            </p>
          </Link>

          <Link
            href="/admin/trips"
            className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              Gestión de viajes
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Crear viajes, asignar recursos y actualizar estados operacionales.
            </p>
          </Link>

          <div className="rounded-2xl bg-white p-5 shadow opacity-70">
            <h2 className="text-xl font-semibold text-slate-900">
              Carga masiva
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Próximo módulo: cargar datos desde Excel o CSV y descargar
              plantillas.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}