// app/dashboard/store/page.tsx

import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase/server-client"
import StorePageClient from "./StorePageClient"

export default async function StorePage() {
  const supabase = await createServerSupabase()

  // Require authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // MVP: no points, no profile fetch, no rewards yet
  return <StorePageClient />
}