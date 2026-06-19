import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  // 303 fuerza GET tras el POST del formulario de logout.
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
