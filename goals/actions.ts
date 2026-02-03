"use server";

import { createServerSupabase } from "@/lib/supabase/server-client";
import type { GoalsPayload } from "./types";

export async function saveGoals(userId: string, goals: GoalsPayload) {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("user_goals")
    .upsert({
      user_id: userId,
      goals,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Failed to save goals:", error);
    throw new Error("Failed to save goals");
  }

  return { success: true };
}