//app\pricing\page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import PayPalCheckout from "@/components/PayPalCheckout";

type PlanId = "monthly" | "quarterly" | "semiannual" | "lifetime" | null;

const tiers = [
  {
    name: "Starter",
    price: "$9 one-time", // ✅ updated price
    duration: "1 month access",
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
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);

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
            const isSelected = selectedPlan === tier.planKey;

            return (
              <Card
                key={tier.name}
                className="
                  relative w-full max-w-sm rounded-2xl flex flex-col justify-between cursor-pointer
                  transform hover:-translate-y-1 hover:shadow-2xl transition-all
                  hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-base-100
                  bg-base-200
                "
              >
                {/* BEST VALUE BADGE */}
                {tier.bestValue && (
                  <div className="
                    absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold 
                    text-green-700 dark:text-green-300
                    bg-green-200 dark:bg-green-900/40
                    shadow-[0_0_12px_rgba(34,197,94,0.4)] dark:shadow-[0_0_12px_rgba(34,197,94,0.8)]
                    animate-pulse
                  ">
                    Best Value
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
  {!isSelected ? (
    <div
      className="w-full flex items-center justify-center py-4 rounded-xl bg-base-content/5 hover:bg-base-content/10 transition cursor-pointer"
      onClick={() => setSelectedPlan(tier.planKey)}
    >
      <div className="w-full text-center font-semibold text-base-content">
        {tier.cta}
      </div>
    </div>
  ) : (
    <div className="w-full flex flex-col items-center">
      <p className="mb-2 text-sm font-medium text-base-content">
        Complete your payment
      </p>
      <div className="w-full">
        <PayPalCheckout
          plan={tier.planKey!}        // ✅ non-null assertion
          amount={tier.price.replace(/\D/g, '')}
        />
      </div>
    </div>
  )}
</CardFooter>

              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-base-content/60">
          Lifetime access · One-time payments · Secure PayPal checkout
        </p>
      </div>
    </section>
  );
}
