import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para componentes del lado del cliente (login).
 * Usa solo la anon key pública; nunca el service role.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
