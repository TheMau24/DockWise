import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  DockOperationalStatus,
  DockYardStatus,
  TruckStatus,
  VehicleType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

async function createTransportCompany(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const rut = String(formData.get("rut") || "").trim();

  if (!name) {
    return;
  }

  await prisma.transportCompany.create({
    data: {
      name,
      rut: rut || null,
      active: true,
    },
  });

  revalidatePath("/admin/masters");
}

async function toggleTransportCompany(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";

  await prisma.transportCompany.update({
    where: { id },
    data: {
      active: !active,
    },
  });

  revalidatePath("/admin/masters");
}

async function createTruck(formData: FormData) {
  "use server";

  const plate = String(formData.get("plate") || "").trim().toUpperCase();
  const type = String(formData.get("type") || "") as VehicleType;
  const status = String(formData.get("status") || "") as TruckStatus;
  const transportCompanyId = String(formData.get("transportCompanyId") || "");
  const qrCodeInput = String(formData.get("qrCode") || "").trim();

  if (!plate || !type || !status || !transportCompanyId) {
    return;
  }

  const qrCode = qrCodeInput || `QR-TRUCK-${plate.replaceAll(" ", "-")}`;

  await prisma.truck.create({
    data: {
      plate,
      type,
      status,
      qrCode,
      active: true,
      transportCompanyId,
    },
  });

  revalidatePath("/admin/masters");
}

async function toggleTruck(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";

  await prisma.truck.update({
    where: { id },
    data: {
      active: !active,
    },
  });

  revalidatePath("/admin/masters");
}

async function createDock(formData: FormData) {
  "use server";

  const code = String(formData.get("code") || "").trim().toUpperCase();
  const side = String(formData.get("side") || "").trim();
  const yardStatus = String(formData.get("yardStatus") || "") as DockYardStatus;
  const operationalStatus = String(
    formData.get("operationalStatus") || ""
  ) as DockOperationalStatus;

  if (!code || !yardStatus || !operationalStatus) {
    return;
  }

  await prisma.dock.create({
    data: {
      code,
      side: side || null,
      yardStatus,
      operationalStatus,
      active: true,
    },
  });

  revalidatePath("/admin/masters");
}

async function toggleDock(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";

  await prisma.dock.update({
    where: { id },
    data: {
      active: !active,
    },
  });

  revalidatePath("/admin/masters");
}

export default async function AdminMastersPage() {
  const [companies, trucks, docks] = await Promise.all([
    prisma.transportCompany.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.truck.findMany({
      include: {
        transportCompany: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.dock.findMany({
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-7xl space-y-6">
        <Link href="/" className="text-sm font-medium text-slate-600">
          ← Volver al dashboard
        </Link>

        <header className="rounded-2xl bg-slate-950 p-6 text-white shadow">
          <p className="text-sm uppercase tracking-wide text-slate-300">
            Administrador
          </p>
          <h1 className="mt-2 text-3xl font-bold">Bases maestras</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Configura los datos principales de DockWise. En esta primera versión
            puedes crear, listar y activar/desactivar empresas, camiones y
            andenes.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Empresas de transporte</h2>

            <form action={createTransportCompany} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej: Transportes ABC"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  RUT
                </label>
                <input
                  name="rut"
                  placeholder="Ej: 76.123.456-7"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>

              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                Crear empresa
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {companies.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no hay empresas creadas.
                </p>
              ) : (
                companies.map((company) => (
                  <div
                    key={company.id}
                    className="rounded-xl border p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{company.name}</p>
                        <p className="text-slate-500">
                          {company.rut || "Sin RUT"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {company.active ? "Activa" : "Inactiva"}
                        </p>
                      </div>

                      <form action={toggleTransportCompany}>
                        <input type="hidden" name="id" value={company.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(company.active)}
                        />
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium">
                          {company.active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Camiones</h2>

            <form action={createTruck} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Patente
                </label>
                <input
                  name="plate"
                  required
                  placeholder="Ej: ABCD-12"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Tipo de vehículo
                </label>
                <select
                  name="type"
                  required
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm"
                >
                  {Object.values(VehicleType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Estado inicial
                </label>
                <select
                  name="status"
                  required
                  defaultValue={TruckStatus.DISPONIBLE}
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm"
                >
                  {Object.values(TruckStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Empresa
                </label>
                <select
                  name="transportCompanyId"
                  required
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm"
                >
                  <option value="">Selecciona empresa</option>
                  {companies
                    .filter((company) => company.active)
                    .map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  QR Code
                </label>
                <input
                  name="qrCode"
                  placeholder="Se genera automático si lo dejas vacío"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>

              <button
                disabled={companies.length === 0}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Crear camión
              </button>

              {companies.length === 0 && (
                <p className="text-xs text-amber-700">
                  Primero debes crear una empresa de transporte.
                </p>
              )}
            </form>

            <div className="mt-5 space-y-3">
              {trucks.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no hay camiones creados.
                </p>
              ) : (
                trucks.map((truck) => (
                  <div key={truck.id} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{truck.plate}</p>
                        <p className="text-slate-500">
                          {truck.type} · {truck.status}
                        </p>
                        <p className="text-slate-500">
                          {truck.transportCompany.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {truck.active ? "Activo" : "Inactivo"}
                        </p>
                      </div>

                      <form action={toggleTruck}>
                        <input type="hidden" name="id" value={truck.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(truck.active)}
                        />
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium">
                          {truck.active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Andenes</h2>

            <form action={createDock} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Código
                </label>
                <input
                  name="code"
                  required
                  placeholder="Ej: ANDEN-01"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Sector / lado
                </label>
                <input
                  name="side"
                  placeholder="Ej: Norte, Sur, Patio, CD2"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Estado patio
                </label>
                <select
                  name="yardStatus"
                  required
                  defaultValue={DockYardStatus.VACIO}
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm"
                >
                  {Object.values(DockYardStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Estado operacional
                </label>
                <select
                  name="operationalStatus"
                  required
                  defaultValue={DockOperationalStatus.HABILITADO}
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm"
                >
                  {Object.values(DockOperationalStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                Crear andén
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {docks.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no hay andenes creados.
                </p>
              ) : (
                docks.map((dock) => (
                  <div key={dock.id} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{dock.code}</p>
                        <p className="text-slate-500">
                          {dock.side || "Sin sector"}
                        </p>
                        <p className="text-slate-500">
                          Patio: {dock.yardStatus}
                        </p>
                        <p className="text-slate-500">
                          Operación: {dock.operationalStatus}
                        </p>
                        <p className="text-xs text-slate-500">
                          {dock.active ? "Activo" : "Inactivo"}
                        </p>
                      </div>

                      <form action={toggleDock}>
                        <input type="hidden" name="id" value={dock.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(dock.active)}
                        />
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium">
                          {dock.active ? "Desactivar" : "Activar"}
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