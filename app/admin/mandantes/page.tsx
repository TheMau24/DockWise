import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function createMandante(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const rut = String(formData.get("rut") || "").trim();
  if (!name) return;

  const exists = await prisma.mandante.findFirst({ where: { name } });
  if (exists) return;

  await prisma.mandante.create({
    data: { name, rut: rut || null, active: true },
  });
  revalidatePath("/admin/mandantes");
}

async function toggleMandante(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  await prisma.mandante.update({ where: { id }, data: { active: !active } });
  revalidatePath("/admin/mandantes");
}

async function linkCompany(formData: FormData) {
  "use server";

  const mandanteId = String(formData.get("mandanteId") || "");
  const transportCompanyId = String(formData.get("transportCompanyId") || "");
  if (!mandanteId || !transportCompanyId) return;

  await prisma.mandanteCompany.upsert({
    where: {
      mandanteId_transportCompanyId: { mandanteId, transportCompanyId },
    },
    update: { active: true },
    create: { mandanteId, transportCompanyId, active: true },
  });
  revalidatePath("/admin/mandantes");
}

async function unlinkCompany(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.mandanteCompany.delete({ where: { id } });
  revalidatePath("/admin/mandantes");
}

export default async function AdminMandantesPage() {
  const [mandantes, companies] = await Promise.all([
    prisma.mandante.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        companyLinks: {
          include: { transportCompany: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.transportCompany.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

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
          <h1 className="mt-2 text-3xl font-bold">Mandantes</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Clientes que subcontratan transportistas (ej: Falabella, IKEA).
            Vincula a cada mandante las empresas de transporte que contrata. Una
            misma empresa puede pertenecer a varios mandantes.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Crear mandante */}
          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Crear mandante</h2>
            <form action={createMandante} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej: Falabella"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">RUT</label>
                <input
                  name="rut"
                  placeholder="Opcional"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>
              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                Crear mandante
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-400">
              También puedes crear mandantes en masa desde Carga masiva.
            </p>
          </article>

          {/* Lista de mandantes + vinculación */}
          <div className="space-y-4">
            {mandantes.length === 0 ? (
              <p className="rounded-2xl bg-white p-5 text-sm text-slate-500 shadow">
                Aún no hay mandantes.
              </p>
            ) : (
              mandantes.map((mandante) => {
                const linkedIds = new Set(
                  mandante.companyLinks.map((l) => l.transportCompanyId)
                );
                const available = companies.filter((c) => !linkedIds.has(c.id));

                return (
                  <article
                    key={mandante.id}
                    className="rounded-2xl bg-white p-5 shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {mandante.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {mandante.rut || "Sin RUT"} ·{" "}
                          {mandante.active ? "Activo" : "Inactivo"} ·{" "}
                          {mandante.companyLinks.length} empresa(s)
                        </p>
                      </div>
                      <form action={toggleMandante}>
                        <input type="hidden" name="id" value={mandante.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(mandante.active)}
                        />
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium">
                          {mandante.active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700">
                        Empresas subcontratadas
                      </p>
                      {mandante.companyLinks.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">
                          Sin empresas vinculadas.
                        </p>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {mandante.companyLinks.map((link) => (
                            <span
                              key={link.id}
                              className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                            >
                              {link.transportCompany.name}
                              <form action={unlinkCompany}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={link.id}
                                />
                                <button
                                  className="font-bold text-slate-500 hover:text-red-600"
                                  title="Quitar"
                                >
                                  ×
                                </button>
                              </form>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {companies.length === 0 ? (
                      <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                        No hay empresas de transporte activas. Crea o importa
                        empresas en{" "}
                        <Link
                          href="/admin/masters"
                          className="font-medium underline"
                        >
                          Bases maestras
                        </Link>{" "}
                        o{" "}
                        <Link
                          href="/admin/bulk"
                          className="font-medium underline"
                        >
                          Carga masiva
                        </Link>{" "}
                        y luego vincúlalas aquí.
                      </p>
                    ) : available.length === 0 ? (
                      <p className="mt-4 text-xs text-slate-500">
                        Todas las empresas activas ya están vinculadas a este
                        mandante.
                      </p>
                    ) : (
                      <form
                        action={linkCompany}
                        className="mt-4 flex items-end gap-2"
                      >
                        <input
                          type="hidden"
                          name="mandanteId"
                          value={mandante.id}
                        />
                        <div className="flex-1">
                          <label className="text-xs font-medium text-slate-700">
                            Vincular empresa
                          </label>
                          <select
                            name="transportCompanyId"
                            required
                            className="mt-1 w-full rounded-xl border bg-white p-3 text-sm"
                          >
                            <option value="">Selecciona empresa</option>
                            {available.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                          Vincular
                        </button>
                      </form>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
