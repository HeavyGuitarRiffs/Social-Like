// app/page.tsx (Landing Page)
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) setHasScrolled(true);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          {/* Pain-point tag */}
          <div className="mb-4 inline-flex items-center rounded-full bg-base-200 px-3 py-1 text-xs font-medium text-base-content/70">
            You’re posting everywhere… but you don’t know what’s actually working.
          </div>

          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* LEFT: TEXT */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                Track the social voice you’ve been blind to.
              </h1>

              <p className="text-base md:text-lg text-base-content/70 max-w-xl">
                SocialLike unifies every platform you create on — giving you one
                clear, compounding analytics engine that finally shows what’s
                working, what’s not, and what to do next.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-content shadow-lg shadow-accent/30 hover:shadow-accent/50 transition"
                >
                  Start tracking my social voice
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-base-content/20 px-6 py-3 text-sm font-semibold text-base-content/80 hover:bg-base-200 transition"
                >
                  See how it works
                </a>
              </div>

              {/* Trust bar */}
              <div className="pt-6 text-xs md:text-sm text-base-content/60 space-y-1">
                <p>
                  Built for creators across YouTube, TikTok, Instagram, X, and
                  more.
                </p>
                <p>
                  Designed by a creator-first founder. No subscriptions. One-time
                  access.
                </p>
              </div>
            </div>

            {/* RIGHT: HERO PREVIEW */}
            <div
              className={`relative rounded-3xl bg-base-200/80 border border-base-content/10 p-4 md:p-6 shadow-xl shadow-base-300/40 transform transition duration-700 ${
                hasScrolled ? "md:translate-y-0" : "md:-translate-y-2"
              }`}
            >
              <div className="space-y-4">
                {/* Header bar */}
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 rounded-full bg-base-content/10" />
                  <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                  </div>
                </div>

                {/* Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Momentum */}
                  <div className="rounded-2xl bg-base-100 p-4 space-y-2">
                    <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                      Momentum score
                    </p>
                    <p className="text-3xl font-extrabold">87</p>
                    <p className="text-xs text-base-content/60">
                      Your last 14 posts are compounding faster than 92% of your
                      history.
                    </p>
                  </div>

                  {/* Linktree detection */}
                  <div className="rounded-2xl bg-base-100 p-4 space-y-2">
                    <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                      Linktree auto-detection
                    </p>
                    <p className="text-sm text-base-content/80">
                      We found 6 platforms connected to your link-in-bio.
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-base-content/70">
                      <li>✓ YouTube · 124 videos</li>
                      <li>✓ TikTok · 312 posts</li>
                      <li>✓ Instagram · 204 posts</li>
                    </ul>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="rounded-2xl bg-base-100 p-4">
                  <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wide mb-2">
                    Posting heatmap
                  </p>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 21 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-6 rounded-md ${
                          i % 5 === 0
                            ? "bg-emerald-500/80"
                            : i % 3 === 0
                            ? "bg-emerald-400/60"
                            : "bg-base-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-2 text-[11px] text-base-content/60">
                    See exactly when your audience is most active across
                    platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY YOU’RE STRUGGLING
      ========================================================= */}
      <section className="border-t border-base-content/10 bg-base-100">
        <div className="mx-auto max-w-5xl px-6 py-16 space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            Why your growth feels random (and it’s not your fault)
          </h2>

          <p className="text-base text-base-content/70 max-w-2xl">
            Every platform gives you a different dashboard, different metrics,
            and different definitions of “success”. You’re forced to guess what’s
            working — and hope your next post lands.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              "Your analytics are scattered across 5–10 different apps.",
              "You don’t know which posts actually drive momentum over time.",
              "You don’t know when your audience is most active across platforms.",
              "You can’t see where your voice is strongest — or where to double down.",
              "You’re stuck reacting to spikes instead of building compounding growth.",
              "You’re creating daily, but your feedback loop is broken.",
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-base-200/70 p-4 text-sm text-base-content/80"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section
        id="how-it-works"
        className="border-t border-base-content/10 bg-base-200/40"
      >
        <div className="mx-auto max-w-5xl px-6 py-16 space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">
              How SocialLike works
            </h2>
            <p className="text-base text-base-content/70 max-w-2xl">
              We turn your scattered social presence into one clear,
              compounding analytics engine.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                Step 1
              </div>
              <h3 className="text-lg font-semibold">
                Connect your socials
              </h3>
              <p className="text-sm text-base-content/70">
                Paste your Linktree or connect platforms directly. We detect
                where you create and start pulling your content and engagement.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                Step 2
              </div>
              <h3 className="text-lg font-semibold">
                We unify your analytics
              </h3>
              <p className="text-sm text-base-content/70">
                SocialLike normalizes your data across platforms, calculates
                momentum and velocity, and builds a single source of truth for
                your growth.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                Step 3
              </div>
              <h3 className="text-lg font-semibold">
                You act with clarity
              </h3>
              <p className="text-sm text-base-content/70">
                See what’s working, when to post, and where your voice is
                strongest — so every piece of content pushes your growth forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURE PREVIEW
      ========================================================= */}
      <section className="border-t border-base-content/10 bg-base-100">
        <div className="mx-auto max-w-5xl px-6 py-16 space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">
              A preview of what you unlock inside the app
            </h2>
            <p className="text-base text-base-content/70 max-w-2xl">
              The best landings don’t just tell you what you get — they show you.
              Here’s a glimpse of the pages you’ll actually use.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Analytics Dashboard",
                desc: "One place to see your cross-platform performance, momentum, and growth trends.",
                note: "Gated for premium users in your current middleware.",
              },
              {
                title: "Insights & Recommendations",
                desc: "Opinionated insights that tell you what to do next — not just what happened.",
                note: "Also gated for premium users. This is where the “aha” moments live.",
              },
              {
                title: "Linktree Intelligence",
                desc: "Paste your link-in-bio once. We detect your platforms and start tracking them.",
                note: "Premium-only in your middleware — a core reason to upgrade.",
              },
            ].map((card, i) => (
              <div key={i} className="rounded-2xl bg-base-200 p-4 space-y-2">
                <h3 className="text-sm font-semibold">{card.title}</h3>
                <p className="text-xs text-base-content/70">{card.desc}</p>
                <p className="text-[11px] text-base-content/60">{card.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          PRICING PREVIEW
      ========================================================= */}
      <section className="border-t border-base-content/10 bg-base-200/40">
        <div className="mx-auto max-w-5xl px-6 py-16 space-y-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            One-time payment. No subscriptions. Full creator analytics.
          </h2>

          <p className="text-base text-base-content/70 max-w-2xl mx-auto">
            Unlock SocialLike Premium once and keep your access. Choose the
            access window that matches your current season — 1 month, 3 months,
            6 months, or lifetime.
          </p>

          <div className="pt-4">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-content shadow-lg shadow-accent/30 hover:shadow-accent/50 transition"
            >
              View pricing & plans
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="border-t border-base-content/10 bg-base-100">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold">
            Start tracking your untracked social voice.
          </h2>

          <p className="text-base text-base-content/70 max-w-2xl mx-auto">
            Your growth becomes clear the moment you connect. Stop guessing.
            Start compounding.
          </p>

          <div className="pt-2">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-content shadow-lg shadow-accent/30 hover:shadow-accent/50 transition"
            >
              Unlock SocialLike Premium
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
