// app/dashboard/store/page.tsx

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import StorePageClient from "./StorePageClient";

export default async function StorePage() {
  const supabase = await createSupabaseServerClient();

  // Require authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // MVP: no points, no profile fetch, no rewards yet
  return <StorePageClient />;
}