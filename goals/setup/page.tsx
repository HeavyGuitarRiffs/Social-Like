// app/dashboard/goals/setup/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import GoalsSetupClient from "./GoalsSetupClient";
import type { Intensity, GoalsSetupClientProps } from "./types";

export default async function GoalsSetupPage() {
  const supabase = await createServerSupabase();

  // 1) Require authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2) Fetch existing goals
  const { data: goals } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const initialGoals = {
    intensity: (goals?.intensity as Intensity) ?? "balanced",
    dailyEnabled: goals?.daily_enabled ?? true,
    weeklyEnabled: goals?.weekly_enabled ?? true,
    dailyComments: String(goals?.daily_comments ?? "3"),
    weeklyPosts: String(goals?.weekly_posts ?? "1"),
  };

  return (
    <GoalsSetupClient
      userId={user.id}
      initialGoals={initialGoals}
    />
  );
}