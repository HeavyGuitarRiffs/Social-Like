//app\pricing\page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

type PlanId = "monthly" | "quarterly" | "semiannual" | "lifetime" | null;

const tiers = [
  {
    name: "Starter",
    price: "$10 one-time",
    duration: "1 month access",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    planKey: "monthly" as PlanId,
    subtitle: "For creators testing the waters",
    features: [
      "Track 1 social platform",
      "Daily analytics refresh",
      "Momentum & velocity scoring",
      "Basic creator dashboard",
      "Link-in-bio analytics (Starter tier)",
    ],
    cta: "Buy Starter",
  },
  {
    name: "Pro",
    price: "$29 one-time",
    duration: "3 months access",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    planKey: "quarterly" as PlanId,
    subtitle: "For creators growing across multiple platforms",
    features: [
      "Track up to 5 platforms",
      "Advanced analytics dashboard",
      "Power Score (full access)",
      "Posting windows & heatmaps",
      "Link-in-bio analytics (Pro tier)",
      "Landing page analytics",
    ],
    cta: "Buy Pro",
  },
  {
    name: "Creator Elite",
    price: "$75 one-time",
    duration: "6 months access",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_ELITE,
    planKey: "semiannual" as PlanId,
    subtitle: "For creators building a long-term system",
    features: [
      "Everything in Pro",
      "Track up to 10 platforms",
      "Advanced multi-platform insights",
      "Creator growth benchmarks",
      "Early access to new analytics modules",
      "Priority feature voting",
    ],
    cta: "Buy Creator Elite",
    bestValue: true,
  },
  {
    name: "Teams / Company",
    price: "From $149 one-time",
    duration: "Lifetime access",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAMS_COMPANY,
    planKey: "lifetime" as PlanId,
    subtitle: "For agencies, teams, and companies",
    features: [
      "Unlimited team members",
      "Team-wide analytics dashboard",
      "Cross-platform performance reporting",
      "Exportable insights & reports",
      "Admin controls",
      "Dedicated support",
    ],
    cta: "Buy Teams License",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<PlanId>(null);

  useEffect(() => {
    if (redirectUrl) window.location.href = redirectUrl;
  }, [redirectUrl]);

  async function handleCheckout(priceId: string, plan: PlanId) {
    try {
      setLoadingPriceId(priceId);

      // TODO: replace with real user
      const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  router.push("/login");
  return;
}

const userId = user.id;;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId, plan }),
      });

      if (!res.ok) {
        console.error("Checkout API error:", await res.text());
        setLoadingPriceId(null);
        return;
      }

      const { url } = await res.json();
      setRedirectUrl(url);
    } catch (err) {
      console.error("Unexpected checkout error:", err);
      setLoadingPriceId(null);
    }
  }

  function isUpgrade(tierPlan: PlanId): boolean {
    if (!userPlan || !tierPlan) return false;
    const order: PlanId[] = ["monthly", "quarterly", "semiannual", "lifetime"];
    return order.indexOf(tierPlan) > order.indexOf(userPlan);
  }

  return (
    <section className="min-h-screen bg-base-100 py-20 px-6">
      <div className="mx-auto max-w-5xl space-y-16">

        {/* HEADER */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-base-content">
            Lifetime access. One-time payment.
          </h1>
          <p className="text-lg text-base-content/70">
            No subscriptions. No recurring fees. Unlock your creator analytics forever.
          </p>
        </div>

        {/* PRICING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          {tiers.map((tier) => {
            const isOwned = tier.planKey && userPlan === tier.planKey;
            const isLoading = tier.priceId && loadingPriceId === tier.priceId;
            const upgradeAvailable = isUpgrade(tier.planKey);

            return (
              <Card
                key={tier.name}
                onClick={() => {
                  if (tier.priceId && !isOwned && !isLoading) {
                    handleCheckout(tier.priceId, tier.planKey);
                  }
                }}
                className="
                  relative w-full max-w-sm rounded-2xl flex flex-col justify-between cursor-pointer
                  transform hover:-translate-y-1 hover:shadow-2xl transition-all
                  hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-base-100
                  bg-base-200
                "
              >
                {/* BEST VALUE BADGE */}
                {tier.bestValue && (
                  <div
                    className="
                      absolute top-3 left-3 
                      rounded-full px-3 py-1 text-xs font-bold 
                      text-green-700 dark:text-green-300
                      bg-green-200 dark:bg-green-900/40
                      shadow-[0_0_12px_rgba(34,197,94,0.4)] dark:shadow-[0_0_12px_rgba(34,197,94,0.8)]
                      animate-pulse
                    "
                  >
                    Best Value
                  </div>
                )}

                {/* OWNED */}
                {isOwned && (
                  <div className="absolute top-3 right-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-black shadow-md">
                    Owned
                  </div>
                )}

                {/* UPGRADE */}
                {upgradeAvailable && !isOwned && (
                  <div className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-md">
                    Upgrade available
                  </div>
                )}

                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold text-base-content">
                    {tier.name}
                  </CardTitle>
                  <p className="text-base-content/70 text-sm">{tier.subtitle}</p>
                </CardHeader>

                <CardContent className="space-y-5 text-center flex flex-col items-center">
                  <p className="text-4xl font-extrabold text-base-content">
                    {tier.price}
                  </p>

                  {tier.bestValue && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-500 dark:text-green-300">
                      Most popular
                    </p>
                  )}

                  <p className="text-base-content/60 text-sm">{tier.duration}</p>

                  <ul className="space-y-2 text-sm mx-auto w-fit text-left">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-accent">✓</span>
                        <span className="text-base-content">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <div className="w-full flex items-center justify-center py-4 rounded-xl bg-base-content/5 hover:bg-base-content/10 transition">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-base-content text-sm">
                        <span className="loading loading-spinner loading-sm" />
                        <span>Redirecting to checkout…</span>
                      </div>
                    ) : isOwned ? (
                      <div className="text-center w-full text-sm font-semibold text-accent">
                        You already own this tier
                      </div>
                    ) : (
                      <div className="w-full text-center font-semibold text-base-content">
                        {tier.cta}
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-base-content/60">
          Lifetime access · One-time payments · Secure Stripe checkout
        </p>
      </div>
    </section>
  );
}