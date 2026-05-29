import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function createOrigin(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();

  if (!name) return;

  const existing = await prisma.origin.findFirst({
    where: { name },
  });

  if (existing) return;

  await prisma.origin.create({
    data: {
      name,
      active: true,
    },
  });

  revalidatePath("/admin/masters/operations");
}

async function toggleOrigin(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";

  await prisma.origin.update({
    where: { id },
    data: { active: !active },
  });

  revalidatePath("/admin/masters/operations");
}

async function createDestination(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();

  if (!name) return;

  const existing = await prisma.destination.findFirst({
    where: { name },
  });

  if (existing) return;

  await prisma.destination.create({
    data: {
      name,
      active: true,
    },
  });

  revalidatePath("/admin/masters/operations");
}

async function toggleDestination(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";

  await prisma.destination.update({
    where: { id },
    data: { active: !active },
  });

  revalidatePath("/admin/masters/operations");
}

async function createContainer(formData: FormData) {
  "use server";

  const code = String(formData.get("code") || "").trim().toUpperCase();

  if (!code) return;

  const existing = await prisma.container.findUnique({
    where: { code },
  });

  if (existing) return;

  await prisma.container.create({
    data: {
      code,
      active: true,
    },
  });

  revalidatePath("/admin/masters/operations");
}

async function toggleContainer(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";

  await prisma.container.update({
    where: { id },
    data: { active: !active },
  });

  revalidatePath("/admin/masters/operations");
}

async function createDriver(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const rut = String(formData.get("rut") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const transportCompanyId = String(formData.get("transportCompanyId") || "");

  if (!name || !rut || !transportCompanyId) return;

  const existing = await prisma.driver.findUnique({
    where: { rut },
  });

  if (existing) return;

  await prisma.driver.create({
    data: {
      name,
      rut,
      phone: phone || null,
      active: true,
      transportCompanyId,
    },
  });

  revalidatePath("/admin/masters/operations");
}

async function toggleDriver(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";

  await prisma.driver.update({
    where: { id },
    data: { active: !active },
  });

  revalidatePath("/admin/masters/operations");
}

export default async function AdminOperationsMastersPage() {
  const [origins, destinations, containers, drivers, companies] =
    await Promise.all([
      prisma.origin.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.destination.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.container.findMany({
        orderBy: { code: "asc" },
      }),
      prisma.driver.findMany({
        include: {
          transportCompany: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.transportCompany.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
      }),
    ]);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="text-sm font-medium text-slate-600">
            ← Volver al panel admin
          </Link>

          <Link
            href="/admin/masters"
            className="text-sm font-medium text-slate-600"
          >
            Ver empresas, camiones y andenes
          </Link>
        </div>

        <header className="rounded-2xl bg-slate-950 p-6 text-white shadow">
          <p className="text-sm uppercase tracking-wide text-slate-300">
            Administrador
          </p>
          <h1 className="mt-2 text-3xl font-bold">Bases operacionales</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Configura orígenes, destinos, contenedores y choferes. Estos datos
            serán usados después para crear viajes reales.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold text-slate-900">Orígenes</h2>

            <form action={createOrigin} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej: CD Pudahuel"
                  className="mt-1 w-full rounded-xl border p-3 text-sm text-slate-900"
                />
              </div>

              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                Crear origen
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {origins.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no hay orígenes creados.
                </p>
              ) : (
                origins.map((origin) => (
                  <div key={origin.id} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {origin.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {origin.active ? "Activo" : "Inactivo"}
                        </p>
                      </div>

                      <form action={toggleOrigin}>
                        <input type="hidden" name="id" value={origin.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(origin.active)}
                        />
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                          {origin.active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold text-slate-900">Destinos</h2>

            <form action={createDestination} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej: Parque Arauco"
                  className="mt-1 w-full rounded-xl border p-3 text-sm text-slate-900"
                />
              </div>

              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                Crear destino
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {destinations.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no hay destinos creados.
                </p>
              ) : (
                destinations.map((destination) => (
                  <div
                    key={destination.id}
                    className="rounded-xl border p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {destination.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {destination.active ? "Activo" : "Inactivo"}
                        </p>
                      </div>

                      <form action={toggleDestination}>
                        <input
                          type="hidden"
                          name="id"
                          value={destination.id}
                        />
                        <input
                          type="hidden"
                          name="active"
                          value={String(destination.active)}
                        />
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                          {destination.active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold text-slate-900">
              Contenedores
            </h2>

            <form action={createContainer} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Código
                </label>
                <input
                  name="code"
                  required
                  placeholder="Ej: CNT-001"
                  className="mt-1 w-full rounded-xl border p-3 text-sm text-slate-900"
                />
              </div>

              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                Crear contenedor
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {containers.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no hay contenedores creados.
                </p>
              ) : (
                containers.map((container) => (
                  <div
                    key={container.id}
                    className="rounded-xl border p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {container.code}
                        </p>
                        <p className="text-xs text-slate-500">
                          {container.active ? "Activo" : "Inactivo"}
                        </p>
                      </div>

                      <form action={toggleContainer}>
                        <input type="hidden" name="id" value={container.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(container.active)}
                        />
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                          {container.active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold text-slate-900">Choferes</h2>

            <form action={createDriver} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej: Juan Pérez"
                  className="mt-1 w-full rounded-xl border p-3 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  RUT
                </label>
                <input
                  name="rut"
                  required
                  placeholder="Ej: 12.345.678-9"
                  className="mt-1 w-full rounded-xl border p-3 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Teléfono
                </label>
                <input
                  name="phone"
                  placeholder="Ej: +56912345678"
                  className="mt-1 w-full rounded-xl border p-3 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Empresa
                </label>
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

              <button
                disabled={companies.length === 0}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Crear chofer
              </button>

              {companies.length === 0 && (
                <p className="text-xs text-amber-700">
                  Primero debes crear una empresa de transporte.
                </p>
              )}
            </form>

            <div className="mt-5 space-y-3">
              {drivers.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no hay choferes creados.
                </p>
              ) : (
                drivers.map((driver) => (
                  <div key={driver.id} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {driver.name}
                        </p>
                        <p className="text-slate-600">{driver.rut}</p>
                        <p className="text-slate-600">
                          {driver.phone || "Sin teléfono"}
                        </p>
                        <p className="text-slate-600">
                          {driver.transportCompany.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {driver.active ? "Activo" : "Inactivo"}
                        </p>
                      </div>

                      <form action={toggleDriver}>
                        <input type="hidden" name="id" value={driver.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(driver.active)}
                        />
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                          {driver.active ? "Desactivar" : "Activar"}
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