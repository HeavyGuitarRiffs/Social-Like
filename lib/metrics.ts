import { createClient } from "@/lib/supabase/server";

export async function getCommentsToday() {
  const supabase = createClient(); // note: not `await` here, createClient is sync

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
