"use client";

import React, { useMemo, useRef } from "react";
import { MetricConfig } from "@/app/dashboard/types";

import { LineChartWithStats } from "./LineChartWithStats";
import { BarChartWithStats } from "./BarChartWithStats";
import { PieChartWithStats } from "./PieChartWithStats";
import { RadarChartWithStats } from "./RadarChartWithStats";
import { ChartShareButton } from "./ChartShareButton";

export type ChartType = "line" | "bar" | "area" | "pie" | "radar";

export type TimeSeriesPoint = {
  date: string;
  value: number;
};

export type CategoryPoint = {
  name: string;
  value: number;
  fill: string;
};

export type RadarPoint = {
  metric: string;
  score: number;
  color?: string;
};

type MetricChartProps = {
  metric: MetricConfig;
  chartType: ChartType;
  connectedSocials?: string[];
};

// -------------------- Smart Number Formatter --------------------
function formatNumber(n: number) {
  if (n >= 10_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 100_000) return (n / 1_000).toFixed(0) + "k";
  if (n >= 10_000) return (n / 1_000).toFixed(1) + "k";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toString();
}

// -------------------- Synthetic Data Generators --------------------
function generateSyntheticTimeSeries(label: string): TimeSeriesPoint[] {
  return Array.from({ length: 14 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    value: i === 0 ? 0 : Math.round(Math.random() * 40),
  }));
}

function generateSyntheticCategories(
  connectedSocials: string[] = []
): CategoryPoint[] {
  const COLORS = ["#6366F1", "#22C55E", "#F97316", "#EC4899", "#0EA5E9"];
  const socials = connectedSocials.length
    ? connectedSocials
    : ["Twitter", "LinkedIn", "Instagram", "Reddit", "GitHub"];

  return socials.map((name, i) => ({
    name,
    value: Math.round(Math.random() * 100),
    fill: COLORS[i % COLORS.length],
  }));
}

// -------------------- Hook --------------------
function useMetricTimeSeries(metricKey: string): TimeSeriesPoint[] {
  return useMemo(() => generateSyntheticTimeSeries(metricKey), [metricKey]);
}

// -------------------- Component --------------------
export function MetricChart({
  metric,
  chartType,
  connectedSocials = [],
}: MetricChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Normalize metric.value (string | number → number)
  const numericValue = Number(metric.value ?? 0);

  // Synthetic fallback (until real API integration)
  const timeSeries = useMetricTimeSeries(metric.key);
  const categories = useMemo(
    () => generateSyntheticCategories(connectedSocials),
    [connectedSocials]
  );

  const radarProps = {
    userId: metric.userId,
    connectedSocials,
  };

  let chartContent: React.ReactNode = null;

  switch (chartType) {
    case "line":
      chartContent = (
        <LineChartWithStats
          data={timeSeries}
          metricLabel={metric.label}
          variant="line"
        />
      );
      break;

    case "area":
      chartContent = (
        <LineChartWithStats
          data={timeSeries}
          metricLabel={metric.label}
          variant="area"
        />
      );
      break;

    case "bar":
      chartContent = (
        <BarChartWithStats data={timeSeries} metricLabel={metric.label} />
      );
      break;

    case "pie":
      chartContent = (
        <PieChartWithStats data={categories} metricLabel={metric.label} />
      );
      break;

    case "radar":
      chartContent = <RadarChartWithStats {...radarProps} />;
      break;
  }

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="w-full">
        {chartContent}
      </div>

      <div className="flex justify-end">
        <ChartShareButton targetRef={containerRef} metric={metric} />
      </div>
    </div>
  );
}