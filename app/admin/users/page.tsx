import Link from "next/link";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LogoutButton } from "@/components/logout-button";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  OPERATOR: "Operador / Coordinador",
  DRIVER: "Chofer",
};

/** Busca un usuario de Supabase Auth por email (paginado simple). */
async function findAuthUserByEmail(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  email: string
) {
  let page = 1;
  const perPage = 1000;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function createUser(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "") as UserRole;
  const active = String(formData.get("active") || "true") === "true";

  if (!name || !email || password.length < 6 || !role) {
    return;
  }

  const admin = createSupabaseAdminClient();

  // 1) Crear (o actualizar si ya existía) en Supabase Auth.
  const existing = await findAuthUserByEmail(admin, email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });
  } else {
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });
    if (error) {
      console.error("createUser auth error:", error.message);
      return;
    }
  }

  // 2) Sincronizar dockwise."User" (fuente de verdad de rol/estado).
  await prisma.user.upsert({
    where: { email },
    update: { name, role, active },
    create: { name, email, role, active },
  });

  revalidatePath("/admin/users");
}

async function toggleUser(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";

  await prisma.user.update({
    where: { id },
    data: { active: !active },
  });

  revalidatePath("/admin/users");
}

async function resetPassword(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || password.length < 6) {
    return;
  }

  const admin = createSupabaseAdminClient();
  const existing = await findAuthUserByEmail(admin, email);
  if (!existing) return;

  await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });

  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-sm font-medium text-slate-600">
            ← Volver al panel administrador
          </Link>
        </div>

        <header className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-6 text-white shadow md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-300">
              Administrador
            </p>
            <h1 className="mt-2 text-3xl font-bold">Gestión de usuarios</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Crea cuentas para administradores, operadores y choferes. Cada
              usuario se crea en Supabase Auth y se sincroniza con la base.
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Crear usuario */}
          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Crear usuario</h2>

            <form action={createUser} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej: Juan Pérez"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Correo
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="usuario@dockwise.cl"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Contraseña temporal
                </label>
                <input
                  name="password"
                  type="text"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Rol
                </label>
                <select
                  name="role"
                  required
                  defaultValue={UserRole.OPERATOR}
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm"
                >
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Estado
                </label>
                <select
                  name="active"
                  defaultValue="true"
                  className="mt-1 w-full rounded-xl border bg-white p-3 text-sm"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                Crear usuario
              </button>
            </form>
          </article>

          {/* Lista de usuarios */}
          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-semibold">Usuarios</h2>

            <div className="mt-4 space-y-3">
              {users.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no hay usuarios creados.
                </p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-xl border p-4 text-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-slate-500">{user.email}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {roleLabels[user.role]}
                          </span>
                          <span
                            className={
                              "rounded-full px-3 py-1 text-xs font-medium " +
                              (user.active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700")
                            }
                          >
                            {user.active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-stretch gap-2 md:items-end">
                        <form action={toggleUser}>
                          <input type="hidden" name="id" value={user.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={String(user.active)}
                          />
                          <button className="w-full rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium md:w-auto">
                            {user.active ? "Desactivar" : "Activar"}
                          </button>
                        </form>

                        <form
                          action={resetPassword}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="email" value={user.email} />
                          <input
                            name="password"
                            type="text"
                            required
                            minLength={6}
                            placeholder="Nueva clave"
                            className="w-32 rounded-lg border p-2 text-xs"
                          />
                          <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium">
                            Resetear
                          </button>
                        </form>
                      </div>
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
