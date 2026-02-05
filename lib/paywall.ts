import { Database } from "@/supabase/types";

export type Subscription = Database["public"]["Tables"]["user_subscriptions"]["Row"];

export function hasAccess(subscription: Subscription | null) {
  if (!subscription) return false;
  if (subscription.plan === "lifetime") return true;
  if (!subscription.expires_at) return false;

  return new Date(subscription.expires_at) > new Date();
}

export function isExpired(subscription: Subscription | null) {
  if (!subscription) return true;
  if (subscription.plan === "lifetime") return false;
  if (!subscription.expires_at) return true; // <— fixes the TS error

  return new Date(subscription.expires_at) < new Date();
}

export function getRemainingDays(subscription: Subscription | null) {
  if (!subscription || !subscription.expires_at) return 0;
  const diff = new Date(subscription.expires_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getPlanFromPriceId(priceId: string) {
  const map: Record<string, string> = {
    [process.env.STRIPE_PRICE_MONTHLY!]: "monthly",
    [process.env.STRIPE_PRICE_QUARTERLY!]: "quarterly",
    [process.env.STRIPE_PRICE_SEMIANNUAL!]: "semiannual",
    [process.env.STRIPE_PRICE_ANNUAL!]: "annual",
    [process.env.STRIPE_PRICE_LIFETIME!]: "lifetime",
  };

  return map[priceId] ?? "unknown";
}

export function calculateExpiry(plan: string) {
  const now = new Date();

  switch (plan) {
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      return now;
    case "quarterly":
      now.setMonth(now.getMonth() + 3);
      return now;
    case "semiannual":
      now.setMonth(now.getMonth() + 6);
      return now;
    case "annual":
      now.setFullYear(now.getFullYear() + 1);
      return now;
    case "lifetime":
      return null;
    default:
      return null;
  }
}