// lib/metrics.ts

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getCommentsToday() {
  const supabase = await createSupabaseServerClient();

  const { count, error } = await supabase
    .from("social_comments")
    .select("*", { count: "exact", head: true })
    .eq("replied", true)
    .gte("replied_at", new Date().toISOString().slice(0, 10));

  if (error) {
    console.error("getCommentsToday error:", error);
    return 0;
  }

  return count ?? 0;
}