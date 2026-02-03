// app/dashboard/success/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server-client";

import SuccessPageClient from "./SuccessPageClient";

export default async function SuccessPage() {
  const supabase = await createServerSupabase();

  // Require authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <SuccessPageClient />;
}
