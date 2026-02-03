// app/dashboard/goals/setup/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server-client";
import GoalsSetupClient from "./GoalsSetupClient";
import type { Intensity } from "./types";

type GoalsPayload = {
  intensity?: Intensity;
  daily_enabled?: boolean;
  weekly_enabled?: boolean;
  daily_comments?: number | string;
  weekly_posts?: number | string;
};

export default async function GoalsSetupPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("user_goals")
    .select("goals")
    .eq("user_id", user.id)
    .maybeSingle();

  const goals = (data?.goals ?? {}) as GoalsPayload;

  const initialGoals = {
    intensity: goals.intensity ?? "balanced",
    dailyEnabled: goals.daily_enabled ?? true,
    weeklyEnabled: goals.weekly_enabled ?? true,
    dailyComments: String(goals.daily_comments ?? "3"),
    weeklyPosts: String(goals.weekly_posts ?? "1"),
  };

  return (
    <GoalsSetupClient
      userId={user.id}
      initialGoals={initialGoals}
    />
  );
}
