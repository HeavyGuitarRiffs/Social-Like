// app/dashboard/connect/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import ConnectPageClient from "./ConnectPageClient";
import type { SocialLink } from "./types";

export default async function ConnectPage() {
  const supabase = await createSupabaseServerClient();

  // 1) Require authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2) Fetch saved socials
  const { data: socials } = await supabase
    .from("user_socials")
    .select("*")
    .eq("user_id", user.id)
    .order("order_index", { ascending: true });

  const initialSocials: SocialLink[] = socials?.length
    ? socials.map((s) => ({
        id: s.id,
        handle: s.handle,
        enabled: s.enabled ?? true,
        platform: (s.platform as SocialLink["platform"]) ?? "unknown",
        followers: 0,
        linktree: s.linktree ?? false,
      }))
    : [];

  const initialEmail = user.email ?? "";
  const initialEmailStatus = user.email_confirmed_at
    ? "verified"
    : "unverified";

  return (
    <ConnectPageClient
      initialSocials={initialSocials}
      initialEmail={initialEmail}
      initialEmailStatus={initialEmailStatus}
    />
  );
}