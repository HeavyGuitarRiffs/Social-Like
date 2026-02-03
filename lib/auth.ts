import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export function createSupabaseServer() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const store = await cookies();
          return store.get(name)?.value;
        },
        set: async (name: string, value: string, options: any) => {
          const store = await cookies();
          store.set({ name, value, ...options });
        },
        remove: async (name: string, options: any) => {
          const store = await cookies();
          store.set({ name, value: "", ...options });
        }
      }
    }
  );
}

export async function getUser() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserWithSubscription() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return { user, subscription };
}

export function isSubscribed(
  subscription: Database["public"]["Tables"]["user_subscriptions"]["Row"] | null
) {
  if (!subscription) return false;
  if (subscription.plan === "lifetime") return true;
  if (!subscription.expires_at) return false;

  return new Date(subscription.expires_at) > new Date();
}