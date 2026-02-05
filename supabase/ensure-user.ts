//supabase\ensure-user.ts

import { SupabaseClient } from "@supabase/supabase-js";


export async function ensureUserRow(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!data && !error) {
    await supabase.from("users").insert({
      auth_id: user.id,
      email: user.email,
      created_at: new Date().toISOString(),
    });
  }
}
