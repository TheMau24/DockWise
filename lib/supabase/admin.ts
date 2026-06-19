import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE ROLE. SOLO servidor.
 * Permite crear/actualizar usuarios en Supabase Auth.
 * NUNCA importar este archivo desde un Client Component.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
