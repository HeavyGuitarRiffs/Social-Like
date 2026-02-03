"use server";

import { createClient } from "@/utils/supabase/server";

export async function saveGoals(goals: string[]) {
  const supabase = await createClient(); // ← FIXED

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("user_goals").insert(
    goals.map((g) => ({
      goal: g,
      user_id: user.id,
    }))
  );

  if (error) {
    console.error("Failed to save goals:", error);
    throw new Error("Failed to save goals");
  }

  return { success: true };
}