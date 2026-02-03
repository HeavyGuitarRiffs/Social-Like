// app/dashboard/notifications/setup/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import NotificationsSetupClient from "./NotificationsSetupClient";

export default async function NotificationsSetupPage() {
  const supabase = await createServerSupabase();

  // 1) Require authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2) Fetch existing preferences
  const { data: prefs } = await supabase
    .from("user_notifications")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const initialPrefs = {
    pushEnabled: prefs?.push_enabled ?? true,
    emailEnabled: prefs?.email_enabled ?? false,
    inAppEnabled: prefs?.in_app_enabled ?? true,
    smartDefaults: prefs?.smart_defaults ?? true,
    intensity: prefs?.intensity ?? "medium",
  };

  return (
    <NotificationsSetupClient
      userId={user.id}
      initialPrefs={initialPrefs}
    />
  );
}