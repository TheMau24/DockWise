import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
};

/**
 * Devuelve el usuario autenticado combinando la sesión de Supabase Auth con el
 * registro de dockwise."User" (fuente de verdad de rol y estado activo).
 * Retorna null si no hay sesión o el email no existe en la base.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email.toLowerCase() },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  return dbUser;
}

/** Ruta de inicio según rol. */
export function roleHome(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/";
    case "OPERATOR":
      return "/operator";
    case "DRIVER":
      return "/driver";
    default:
      return "/login";
  }
}

/** Exige sesión válida y usuario activo; si no, redirige a /login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.active) redirect("/login?error=inactive");
  return user;
}

/**
 * Exige que el usuario tenga uno de los roles permitidos.
 * ADMIN es superusuario: puede entrar a cualquier sección.
 * Si el rol no aplica, redirige a su propio home.
 */
export async function requireRole(allowed: UserRole[]): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role === "ADMIN" || allowed.includes(user.role)) {
    return user;
  }
  redirect(roleHome(user.role));
}
