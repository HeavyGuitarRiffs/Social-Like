// app/dashboard/success/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import SuccessPageClient from "./SuccessPageClient";

export default async function SuccessPage() {
  const supabase = await createSupabaseServerClient();


  // Require authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <SuccessPageClient />;
}