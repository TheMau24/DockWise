import { redirect } from "next/navigation";
import { getSessionUser, roleHome } from "@/lib/auth";
import LoginForm from "./login-form";

export const metadata = {
  title: "Ingresar · DockWise",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const user = await getSessionUser();
  if (user?.active) {
    redirect(roleHome(user.role));
  }

  const sp = await searchParams;
  const redirectTo =
    sp.redirectTo && sp.redirectTo.startsWith("/") ? sp.redirectTo : "/";
  const initialError =
    sp.error === "inactive"
      ? "Tu cuenta está desactivada. Contacta a un administrador."
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <header className="text-center">
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Plataforma logística
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">DockWise</h1>
          <p className="mt-2 text-sm text-slate-500">
            Ingresa con tu cuenta para continuar.
          </p>
        </header>

        <LoginForm redirectTo={redirectTo} initialError={initialError} />
      </section>
    </main>
  );
}
