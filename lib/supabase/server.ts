import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para usar en Server Components, Server Actions y Route Handlers.
 * Lee/escribe la sesión usando las cookies de la request (vía @supabase/ssr).
 * NO usar en el cliente.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll fue llamado desde un Server Component (donde no se pueden
            // escribir cookies). El middleware ya se encarga de refrescar la
            // sesión, así que es seguro ignorarlo.
          }
        },
      },
    }
  );
}
