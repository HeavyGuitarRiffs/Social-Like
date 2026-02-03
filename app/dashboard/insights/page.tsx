// app/dashboard/insights/page.tsx

"use client";

import React from "react";
import { ChartWrapper } from "@/app/dashboard/analytics/components/ChartWrapper";

// Named exports
import { ABTestingComponent } from "./components/ABTesting";
import { BestTimesToPost } from "./components/BestTimesToPost";
import { ContentBreakdown } from "./components/ContentBreakdown";
import { DeviceBreakdownComponent } from "./components/DeviceBreakdown";
import { FullSparkline } from "./components/FullSparkline";
import { LinktreePerformance } from "./components/LinktreePerformance";
import { ReferrerBreakdownComponent } from "./components/ReferrerBreakdown";
import { TopPosts } from "./components/TopPosts";
import { GeoBreakdownComponent } from "./components/GeoBreakdown";
import { Heatmap } from "./components/Heatmap";

// Default exports
import LinkList from "./components/LinkList";
import Recommendations from "./components/Recommendations";

export default function InsightsPage() {
  return (
    <div className="flex flex-col w-full px-4 py-6 space-y-12">

      {/* OVERVIEW */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartWrapper title="Full Sparkline" platforms={[]}>
            {() => <FullSparkline linkId="" />}
          </ChartWrapper>

          <ChartWrapper title="Top Posts" platforms={[]}>
            {() => <TopPosts />}
          </ChartWrapper>
        </div>
      </section>

      {/* CONTENT INSIGHTS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Content Insights</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartWrapper title="Content Breakdown" platforms={[]}>
            {() => <ContentBreakdown />}
          </ChartWrapper>

          <ChartWrapper title="Best Times to Post" platforms={[]}>
            {() => <BestTimesToPost />}
          </ChartWrapper>
        </div>
      </section>

      {/* AUDIENCE INSIGHTS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Audience Insights</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartWrapper title="Geographic Breakdown" platforms={[]}>
            {() => <GeoBreakdownComponent data={[]} platforms={[]} />}
          </ChartWrapper>

          <ChartWrapper title="Device Breakdown" platforms={[]}>
            {() => <DeviceBreakdownComponent data={[]} platforms={[]} />}
          </ChartWrapper>
        </div>
      </section>

      {/* TRAFFIC & LINKS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Traffic & Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartWrapper title="Referrer Breakdown" platforms={[]}>
            {() => <ReferrerBreakdownComponent data={[]} platforms={[]} />}
          </ChartWrapper>

          <ChartWrapper title="Linktree Performance" platforms={[]}>
            {() => <LinktreePerformance />}
          </ChartWrapper>
        </div>

        <ChartWrapper title="Link List" platforms={[]}>
          {() => <LinkList />}
        </ChartWrapper>
      </section>

      {/* BEHAVIOR */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Behavior</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartWrapper title="Hourly Heatmap" platforms={[]}>
            {() => <Heatmap linkId="" />}
          </ChartWrapper>

          <ChartWrapper title="A/B Testing" platforms={[]}>
            {() => <ABTestingComponent data={[]} platforms={[]} />}
          </ChartWrapper>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Recommendations</h2>

        <ChartWrapper title="AI Recommendations" platforms={[]}>
          {() => <Recommendations />}
        </ChartWrapper>
      </section>

    </div>
  );
}