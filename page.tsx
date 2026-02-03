"use client";

import React, { useState } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";

import DailyChallengeCard from "@/components/dashboard/DailyChallengeCard";
import HighlightedComments from "@/components/dashboard/HighlightedComments";

import { MetricChart } from "@/components/charts/MetricChart";
import type { MetricConfig } from "@/app/dashboard/types"; // shared type

// -------------------- Metrics Definitions --------------------
const METRICS: MetricConfig[] = [
  { key: "commentsToday", label: "Comments Today", value: 42, description: "Number of comments you replied to today." },
  { key: "commentsWeek", label: "This Week", value: 312, description: "Total comments replied to this week." },
  { key: "commentsMonth", label: "This Month", value: 1248, description: "Total comments replied to this month." },
  { key: "streak", label: "Day Streak", value: 6, description: "Consecutive days you’ve hit your engagement goal." },

  { key: "avgTimePerSocial", label: "Avg Time per Social", value: "2h 14m/day", description: "Average time spent per social platform." },
  { key: "totalTimeOnApp", label: "Total Time on App", value: "5h 23m/week", description: "Total time spent on the app." },
  { key: "totalPosts", label: "Total Posts", value: 128, description: "Total posts on all socials combined." },
  { key: "conversionPages", label: "Conversion Pages", value: "5 active", description: "Number of pages set up for conversions." },

  { key: "mostPopularKeywords", label: "Most Popular Keywords", value: "AI, SaaS, Startup", description: "Top keywords used in comments." },
  { key: "favoriteNiche", label: "Favorite Niche", value: "Productivity", description: "The niche you interact with most." },
  { key: "mostCommentedNiche", label: "Most Commented Niche", value: "AI", description: "Niche with the most engagement." },
  { key: "leastCommentedNiche", label: "Least Commented Niche", value: "Crypto", description: "Niche with the least engagement." },

  { key: "mostActiveCommenter", label: "Most Active Commenter", value: "user123", description: "User with the most comments." },
  { key: "leastActiveCommenter", label: "Least Active Commenter", value: "user789", description: "User with the fewest comments." },

  { key: "ranking", label: "Ranking", value: "#12 in Country", description: "Your engagement ranking and leaderboard position." },
  { key: "adSelling", label: "Ad Selling (Future)", value: "Coming Soon", description: "Future feature: monetize posts with ads." },
];

const MOMENTUM_METRIC: MetricConfig = {
  key: "momentum",
  label: "Momentum",
  value: "+18%",
  description: "Engagement velocity compared to last week.",
};

// -------------------- Chart Type --------------------
type ChartType = "line" | "bar" | "area" | "pie" | "radar";

// -------------------- Chart Switcher --------------------
function ChartSwitcher({
  chartType,
  onChange,
}: {
  chartType: ChartType;
  onChange: (type: ChartType) => void;
}) {
  const options = [
    { type: "line", label: "Line" },
    { type: "bar", label: "Bar" },
    { type: "area", label: "Area" },
    { type: "pie", label: "Pie" },
    { type: "radar", label: "Radar" },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt.type}
          variant={chartType === opt.type ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(opt.type)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

// -------------------- Metric Drawer --------------------
function MetricDrawer({ metric }: { metric: MetricConfig }) {
  const [chartType, setChartType] = useState<ChartType>("line");

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-4 space-y-1">
            <p className="text-3xl font-extrabold">{metric.value}</p>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
          </CardContent>
        </Card>
        
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{metric.label}</DrawerTitle>
          <DrawerDescription>{metric.description ?? ""}</DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-6 space-y-4">
          <ChartSwitcher chartType={chartType} onChange={setChartType} />
          <MetricChart
            metric={metric}      // ✅ TS-safe, userId inside metric
            chartType={chartType}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// -------------------- Dashboard Page --------------------
export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* METRICS GRID */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICS.map((metric) => (
            <MetricDrawer key={metric.key} metric={metric} />
          ))}
        </section>

        {/* DAILY CHALLENGE */}
        <DailyChallengeCard completed={1} goal={3} />

        {/* HIGHLIGHTED COMMENTS */}
        <HighlightedComments
          initialComments={[
            "This is a great post!",
            "Love this insight.",
          ]}
        />

        {/* MOMENTUM METRIC */}
        <MetricDrawer metric={MOMENTUM_METRIC} />
      </div>
    </main>
  );
}
