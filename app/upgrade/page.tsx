// /app/upgrade/page.tsx
"use client";

import { useState } from "react";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$10",
    description: "Perfect to try Qubit for a month.",
    stripePriceEnv: "STRIPE_PRICE_MONTHLY",
  },
  {
    id: "quarterly",
    label: "3 Months",
    price: "$30",
    description: "Commit to building momentum.",
    stripePriceEnv: "STRIPE_PRICE_QUARTERLY",
  },
  {
    id: "semiannual",
    label: "6 Months",
    price: "$75",
    description: "For serious creators.",
    stripePriceEnv: "STRIPE_PRICE_SEMIANNUAL",
  },
  {
    id: "annual",
    label: "Yearly",
    price: "$149",
    description: "Best value for long-term growth.",
    stripePriceEnv: "STRIPE_PRICE_ANNUAL",
  },
];

export default function UpgradePage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    try {
      setLoadingPlan(planId);
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-base-100 text-base-content px-4 py-16 flex justify-center">
      <div className="max-w-4xl w-full space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="opacity-80">
            Unlock full access to Qubit and turn your creator activity into
            measurable momentum.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.id} className="card bg-base-200 shadow-md">
              <div className="card-body items-center text-center space-y-3">
                <h2 className="card-title">{plan.label}</h2>
                <p className="text-2xl font-bold">{plan.price}</p>
                <p className="text-sm opacity-70">{plan.description}</p>
                <button
                  className="btn btn-primary btn-sm mt-2"
                  disabled={loadingPlan === plan.id}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {loadingPlan === plan.id ? "Redirecting..." : "Upgrade"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}