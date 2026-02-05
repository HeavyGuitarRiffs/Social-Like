"use client";

import React from "react";
import { TimeSeriesPoint } from "./MetricChart";
import { useTheme } from "next-themes";

type Props = {
  data: TimeSeriesPoint[];
  label: string;
};

export function ChartLegend({ data, label }: Props) {
  const { theme } = useTheme(); // <-- moved above conditional
  const isDark = theme === "dark";

  if (!data.length) return null; // <-- now safe

  const last = data[data.length - 1];
  const prev = data[data.length - 2] ?? last;

  const pct =
    prev.value === 0 ? 0 : ((last.value - prev.value) / prev.value) * 100;

  const isUp = pct > 0;
  const isDown = pct < 0;

  const metricColors: Record<string, string> = {
    comments: "#22C55E",
    likes: "#3B82F6",
    views: "#A855F7",
    followers: "#F59E0B",
  };

  const metricColor =
    metricColors[label.toLowerCase()] ?? (isUp ? "#22C55E" : "#F43F5E");

  const arrow = isUp ? "▲" : isDown ? "▼" : "→";

  function formatNumber(n: number) {
    if (n >= 10_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 100_000) return (n / 1_000).toFixed(0) + "k";
    if (n >= 10_000) return (n / 1_000).toFixed(1) + "k";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return n.toString();
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  let scaleLabel = "";
  if (maxValue >= 10_000_000) scaleLabel = "tens of millions";
  else if (maxValue >= 1_000_000) scaleLabel = "millions";
  else if (maxValue >= 100_000) scaleLabel = "hundreds of thousands";
  else if (maxValue >= 10_000) scaleLabel = "tens of thousands";
  else if (maxValue >= 1_000) scaleLabel = "thousands";
  else if (maxValue >= 100) scaleLabel = "hundreds";

  const sparkPoints = data
    .map((d, i) => {
      const x = i * (60 / data.length);
      const y = 20 - (d.value / maxValue) * 20;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex items-center justify-between text-xl font-bold">
      <div className="flex flex-col">
        <span>{label}</span>

        {scaleLabel && (
          <span className="text-sm font-normal text-muted-foreground">
            Values shown in {scaleLabel}
          </span>
        )}

        <span className="text-sm text-muted-foreground">
          Last value: {formatNumber(last.value)}
        </span>

        <svg width="60" height="20" className="mt-1">
          <polyline
            fill="none"
            stroke={metricColor}
            strokeWidth="2"
            points={sparkPoints}
          />
        </svg>
      </div>

      <span className="flex items-center gap-2" style={{ color: metricColor }}>
        <span className="text-3xl">{arrow}</span>
        <span className="text-3xl">
          {pct >= 0 ? "+" : ""}
          {pct.toFixed(1)}%
        </span>
      </span>
    </div>
  );
}