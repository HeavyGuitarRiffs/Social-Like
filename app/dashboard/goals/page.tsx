import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import GoalsPageClient from "./GoalsPageClient";
import type { GoalsPayload } from "./types";

export default async function GoalsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("user_goals")
    .select("goals")
    .eq("user_id", user.id)
    .maybeSingle();

  const goals = (data?.goals as Partial<GoalsPayload>) ?? {};

  const initialGoals: GoalsPayload = {
    immediate: goals.immediate ?? [],
    midterm: goals.midterm ?? [],
    longterm: goals.longterm ?? [],
  };

  // TODO: replace with real plan lookup
  const plan = "free";

  return (
    <GoalsPageClient
      userId={user.id}
      plan={plan}
      initialGoals={initialGoals}
    />
  );
}