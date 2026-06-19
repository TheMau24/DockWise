import { config } from "dotenv";
// Carga primero .env (DATABASE_URL) y luego .env.local (claves Supabase).
config({ path: ".env" });
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type UserRole } from "@prisma/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. " +
      "Agrega SUPABASE_SERVICE_ROLE_KEY a tu .env.local antes de correr este script."
  );
}
if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const users: SeedUser[] = [
  {
    name: "Administrador DockWise",
    email: "admin@dockwise.cl",
    password: "DockwiseAdmin2026",
    role: "ADMIN",
  },
  {
    name: "Operador DockWise",
    email: "operador@dockwise.cl",
    password: "DockwiseOperador2026",
    role: "OPERATOR",
  },
  {
    name: "Chofer DockWise",
    email: "chofer@dockwise.cl",
    password: "DockwiseChofer2026",
    role: "DRIVER",
  },
];

async function findAuthUserByEmail(email: string) {
  // Paginación simple; suficiente para el set inicial de usuarios.
  let page = 1;
  const perPage = 1000;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw error;
    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  console.log("Creando usuarios de Supabase Auth para DockWise...\n");

  for (const user of users) {
    const email = user.email.toLowerCase();

    // 1) Crear o actualizar el usuario en Supabase Auth.
    const existing = await findAuthUserByEmail(email);

    if (existing) {
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name, role: user.role },
      });
      console.log(`↻ Auth actualizado: ${email}`);
    } else {
      const { error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name, role: user.role },
      });
      if (error) throw error;
      console.log(`✓ Auth creado:     ${email}`);
    }

    // 2) Sincronizar el registro en dockwise."User" (fuente de verdad de rol).
    await prisma.user.upsert({
      where: { email },
      update: { name: user.name, role: user.role, active: true },
      create: { name: user.name, email, role: user.role, active: true },
    });
    console.log(`  → dockwise.User sincronizado (${user.role})\n`);
  }

  console.log("Listo. Credenciales de prueba:");
  for (const user of users) {
    console.log(`  ${user.email}  /  ${user.password}  (${user.role})`);
  }
}

main()
  .catch((error) => {
    console.error("create-auth-users falló:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
