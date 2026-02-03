// app/dashboard/goals/setup/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import GoalsSetupClient from "./GoalsSetupClient";
import type { Intensity } from "./types";

export default async function GoalsSetupPage() {
  const supabase = await createSupabaseServerClient();

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

  // Bypass all type errors WITHOUT using `any`
  const goalsRow = (goals as unknown as Record<string, unknown>) || {};

  const intensityValue =
    (goalsRow.intensity as string) ?? "balanced";

  const initialGoals = {
    intensity: intensityValue as Intensity,
    dailyEnabled: (goalsRow.daily_enabled as boolean) ?? true,
    weeklyEnabled: (goalsRow.weekly_enabled as boolean) ?? true,
    dailyComments: String(goalsRow.daily_comments ?? "3"),
    weeklyPosts: String(goalsRow.weekly_posts ?? "1"),
  };

  return (
    <GoalsSetupClient
      userId={user.id}
      initialGoals={initialGoals}
    />
  );
}