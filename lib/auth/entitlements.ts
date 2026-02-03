import { User } from "@supabase/supabase-js";

const ADMIN_EMAILS = [
  "you@yourdomain.com", // 👈 add your email
];

export function isAdmin(user: User | null) {
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email);
}

export function hasActiveSubscription(subscription: { status?: string } | null) {
  return subscription?.status === "active";
}
