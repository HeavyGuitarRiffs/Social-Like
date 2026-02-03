import GoogleLoginDemo from "./GoogleLoginDemo";
import { createServerSupabase } from "@/lib/supabase/server-client";


export default async function GoogleLoginPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log({ user });
  return <GoogleLoginDemo user={user} />;
}
