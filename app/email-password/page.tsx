import EmailPasswordDemo from "./EmailPasswordDemo";
import { createServerSupabase } from "@/lib/supabase/server-client";

export default async function EmailPasswordPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log({ user });
  return <EmailPasswordDemo user={user} />;
}
