//app\dashboard\analytics\components\PostsChart.tsx
"use client";

import React from "react";
import {
  DateRangePicker,
  type DateRangeValue,
} from "./components/DateRangePicker";

import { PlatformSelector } from "./components/PlatformSelector";
import { ChartWrapper } from "./components/ChartWrapper";

import { FollowersChart } from "./components/FollowersChart";
import { GrowthChart } from "./components/GrowthChart";
import { EngagementVelocityChart as EngagementChart } from "./components/EngagementChart";
import { LikesChart } from "./components/LikesChart";
import { PostsChart } from "./components/PostsChart";

export default function AnalyticsPage() {
  const [range, setRange] = React.useState<DateRangeValue>("30d");

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
            <ChartWrapper title="Followers" platforms={selectedPlatforms}>
              {({ selectedPlatforms }) => (
                <FollowersChart
                  range={range}
                  platforms={selectedPlatforms}
                />
              )}
            </ChartWrapper>

            <ChartWrapper title="Growth" platforms={selectedPlatforms}>
              {({ selectedPlatforms }) => (
                <GrowthChart
                  range={range}
                  platforms={selectedPlatforms}
                />
              )}
            </ChartWrapper>
          </div>
        </section>

        {/* ENGAGEMENT */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Engagement</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartWrapper title="Engagement Rate" platforms={selectedPlatforms}>
              {({ selectedPlatforms }) => (
                <EngagementChart
                  range={range}
                  platforms={selectedPlatforms}
                />
              )}
            </ChartWrapper>

            <ChartWrapper title="Likes" platforms={selectedPlatforms}>
              {({ selectedPlatforms }) => (
                <LikesChart
                  range={range}
                  platforms={selectedPlatforms}
                />
              )}
            </ChartWrapper>
          </div>
        </section>

        {/* PUBLISHING */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Publishing</h2>

          <ChartWrapper title="Posts" platforms={selectedPlatforms}>
            {({ selectedPlatforms }) => (
              <PostsChart
                range={range}
                platforms={selectedPlatforms}
              />
            )}
          </ChartWrapper>
        </section>
      </div>
    </div>
  );
}