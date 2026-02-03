// app/dashboard/profile/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server-client";
import ProfilePageClient from "./ProfilePageClient";
import type { UserAvatar, SocialLink } from "./types";

export default async function ProfilePage() {
  const supabase = await createServerSupabase();

  // 1) Require authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2) Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("user_avatars")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<UserAvatar>();

  if (profileError) {
    console.error("Profile fetch error:", profileError);
  }

  // 3) Fetch socials (no metrics)
  const { data: savedSocials, error: socialsError } = await supabase
    .from("user_socials")
    .select("id, handle, enabled, linktree")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (socialsError?.message) {
    console.error("Socials fetch error:", socialsError);
  }

  const socials: SocialLink[] =
    savedSocials?.map((s) => ({
      id: s.id,
      handle: s.handle,
      enabled: s.enabled ?? false,
      linktree: s.linktree ?? false,
      // No metrics on profile page
      metrics: { power_level: 0 },
    })) ?? [];

  const initialProfile: UserAvatar = {
    display_name: profile?.display_name ?? "",
    bio: profile?.bio ?? "",
    country: profile?.country ?? "",
    timezone:
      profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    avatar_url: profile?.avatar_url ?? null,
  };

  return (
    <ProfilePageClient
      initialProfile={initialProfile}
      initialSocials={socials}
      userId={user.id}
    />
  );
}