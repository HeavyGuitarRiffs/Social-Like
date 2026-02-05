//lib\auth.ts

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/supabase/types";

// Minimal interface for the cookie getter
interface CookieGetter {
  get(name: string): { value: string } | undefined;
}

// Extend the real Next.js cookie store type safely
type CookieStoreWithMutations = CookieGetter & {
  set?: (name: string, value: string, options?: CookieOptions) => void;
  delete?: (name: string, options?: CookieOptions) => void;
};

export function createSupabaseServer() {
  // Cast through unknown → then to our safe interface
  const store = cookies() as unknown as CookieStoreWithMutations;

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          store.set?.(name, value, options);
        },
        remove(name: string, options?: CookieOptions) {
          store.delete?.(name, options);
        }
      }
    }
  );
}

/* -------------------------------------------------- */
/* USER HELPERS                                        */
/* -------------------------------------------------- */

export async function getUser() {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getUserWithSubscription() {
  const supabase = createSupabaseServer();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return null;

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  return { user: userData.user, subscription };
}

/* -------------------------------------------------- */
/* SUBSCRIPTION LOGIC                                  */
/* -------------------------------------------------- */

export function isSubscribed(
  subscription: Database["public"]["Tables"]["user_subscriptions"]["Row"] | null
) {
  if (!subscription) return false;
  if (subscription.plan === "lifetime") return true;
  if (!subscription.expires_at) return false;
  return new Date(subscription.expires_at) > new Date();
}