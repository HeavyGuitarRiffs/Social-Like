"use client";

import React, { useMemo } from "react";
import { TimeSeriesPoint } from "./MetricChart";
import { useTheme } from "next-themes";

type Props = {
  data: TimeSeriesPoint[];
  big?: boolean;
};

export function ChartStats({ data, big = false }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // -----------------------------
  // Number formatter (same as charts)
  // -----------------------------
  function formatNumber(n: number) {
    if (n >= 10_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 100_000) return (n / 1_000).toFixed(0) + "k";
    if (n >= 10_000) return (n / 1_000).toFixed(1) + "k";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return n.toString();
  }

  // -----------------------------
  // Date formatter
  // -----------------------------
  function formatDate(d: string) {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // -----------------------------
  // Compute stats
  // -----------------------------
  const stats = useMemo(() => {
    if (!data.length) {
      return {
        avg7: 0,
        sinceLastWeek: 0,
        bestDayLabel: "-",
        bestDayValue: 0,
      };
    }

    const lastIndex = data.length - 1;
    const last = data[lastIndex];

    // Last 7 days average
    const last7 = data.slice(Math.max(0, data.length - 7));
    const avg7 =
      last7.reduce((sum, p) => sum + p.value, 0) / (last7.length || 1);

    // Week-over-week change
    const lastWeekIndex = Math.max(0, lastIndex - 7);
    const lastWeek = data[lastWeekIndex];

    const sinceLastWeek =
      lastWeek.value === 0 || lastWeek === last
        ? 0
        : ((last.value - lastWeek.value) / lastWeek.value) * 100;

    // Best day
    const best = data.reduce(
      (acc, p) => (p.value > acc.value ? p : acc),
      data[0]
    );

    return {
      avg7,
      sinceLastWeek,
      bestDayLabel: best.date,
      bestDayValue: best.value,
    };
  }, [data]);

  // -----------------------------
  // UI sizing
  // -----------------------------
  const size = big ? "text-2xl font-extrabold" : "text-sm font-semibold";
  const labelSize = big ? "text-base" : "text-xs";

  // -----------------------------
  // Theme-aware band color
  // -----------------------------
  const bandColor =
    stats.sinceLastWeek > 10
      ? isDark
        ? "bg-emerald-500/10 text-emerald-400"
        : "bg-emerald-100 text-emerald-600"
      : stats.sinceLastWeek < -10
      ? isDark
        ? "bg-rose-500/10 text-rose-400"
        : "bg-rose-100 text-rose-600"
      : isDark
      ? "bg-slate-500/10 text-slate-300"
      : "bg-slate-200 text-slate-600";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* 7-day average */}
      <div className="flex flex-col">
        <span className={`text-muted-foreground ${labelSize}`}>
          7‑day average
        </span>
        <span className={size}>{formatNumber(stats.avg7)}</span>
      </div>

      {/* Since last week */}
      <div className="flex flex-col">
        <span className={`text-muted-foreground ${labelSize}`}>
          Since last week
        </span>
        <span
          className={`${size} inline-flex w-fit px-3 py-1 rounded-full ${bandColor}`}
        >
          {stats.sinceLastWeek >= 0 ? "+" : ""}
          {stats.sinceLastWeek.toFixed(1)}%
        </span>
      </div>

      {/* Best day */}
      <div className="flex flex-col">
        <span className={`text-muted-foreground ${labelSize}`}>
          Best day
        </span>
        <span className={size}>
          {formatDate(stats.bestDayLabel)} ·{" "}
          {formatNumber(stats.bestDayValue)}
        </span>
      </div>

    </div>
  );
}