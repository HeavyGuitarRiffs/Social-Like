//app/dashboard/linktree/page.tsx

"use client";

import React from "react";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/app/dashboard/analytics/components/DateRangePicker";

import { PlatformSelector } from "@/app/dashboard/analytics/components/PlatformSelector";

import LinkAnalytics from "./components/LinkAnalytics";
import LinkAnalyticsLinks from "./components/LinkAnalyticsLinks";
import LinkAnalyticsCountries from "./components/LinkAnalyticsCountries";
import LinkAnalyticsDevices from "./components/LinkAnalyticsDevices";
import LinkAnalyticsReferrers from "./components/LinkAnalyticsReferrers";

export default function LinktreeDashboardPage() {
  // Global date range
  const [range, setRange] = React.useState<DateRangeValue>("30d");

  // Static platform list for v1
  const ALL_PLATFORMS = [
    "instagram",
    "tiktok",
    "youtube",
    "twitter",
    "facebook",
  ];

  const [selectedPlatforms, setSelectedPlatforms] =
    React.useState<string[]>(ALL_PLATFORMS);

  return (
    <div className="flex flex-col w-full">

      {/* Sticky Filters */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <DateRangePicker value={range} onChange={setRange} />

        <PlatformSelector
          mode="total"
          onModeChange={() => {}}
          platforms={ALL_PLATFORMS}
          selectedPlatforms={selectedPlatforms}
          onPlatformChange={setSelectedPlatforms}
        />
      </div>

      <div className="px-4 py-6 space-y-12">

        {/* OVERVIEW */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LinkAnalytics range={range} platforms={selectedPlatforms} />
            <LinkAnalyticsLinks range={range} platforms={selectedPlatforms} />
          </div>
        </section>

        {/* GEOGRAPHY */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Geography</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LinkAnalyticsCountries
              range={range}
              platforms={selectedPlatforms}
            />
            <LinkAnalyticsReferrers
              range={range}
              platforms={selectedPlatforms}
            />
          </div>
        </section>

        {/* DEVICES */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Devices</h2>

          <LinkAnalyticsDevices range={range} platforms={selectedPlatforms} />
        </section>

      </div>
    </div>
  );
}