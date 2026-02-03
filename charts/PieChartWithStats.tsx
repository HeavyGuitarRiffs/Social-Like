"use client";

import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
} from "recharts";
import { CategoryPoint } from "./MetricChart";
import { useTheme } from "next-themes";

type Props = {
  data: CategoryPoint[];
  metricLabel: string;
};

export function PieChartWithStats({ data, metricLabel }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme-aware colors
  const tooltipBg = isDark ? "#0F172A" : "#ffffff";
  const tooltipText = isDark ? "#ffffff" : "#0B1020";

  // Smart number formatter (same as all other charts)
  function formatNumber(n: number) {
    if (n >= 10_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 100_000) return (n / 1_000).toFixed(0) + "k";
    if (n >= 10_000) return (n / 1_000).toFixed(1) + "k";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return n.toString();
  }

  // -------------------- Derived data --------------------
  const displayedData = useMemo(() => {
    if (!activeCategory) return data;
    return data.filter((d) => d.name === activeCategory);
  }, [data, activeCategory]);

  // -------------------- Stats calculation --------------------
  const stats = useMemo(() => {
    if (!data.length)
      return {
        avg7: 0,
        sinceLastWeek: 0,
        topSocial: "-",
        topValue: 0,
      };

    const last7 = data.slice(-7);
    const avg7 =
      last7.reduce((sum, d) => sum + d.value, 0) / (last7.length || 1);

    const lastWeekIndex = Math.max(0, data.length - 7);
    const lastWeek = data[lastWeekIndex];

    const last = data[data.length - 1];

    const sinceLastWeek =
      lastWeek.value === 0 || lastWeek === last
        ? 0
        : ((last.value - lastWeek.value) / lastWeek.value) * 100;

    const top = data.reduce(
      (acc, d) => (d.value > acc.value ? d : acc),
      data[0]
    );

    return {
      avg7,
      sinceLastWeek,
      topSocial: top.name,
      topValue: top.value,
    };
  }, [data]);

  // -------------------- Total sum --------------------
  const totalValue = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data]
  );

  const activeValue = useMemo(() => {
    if (!activeCategory) return totalValue;
    return data.find((d) => d.name === activeCategory)?.value ?? 0;
  }, [activeCategory, data, totalValue]);

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <span className="text-xs text-muted-foreground">7‑day average</span>
          <div className="text-2xl font-extrabold">
            {formatNumber(stats.avg7)}
          </div>
        </div>

        <div>
          <span className="text-xs text-muted-foreground">Since last week</span>
          <div
            className={`text-2xl font-extrabold ${
              stats.sinceLastWeek > 0
                ? "text-emerald-400"
                : stats.sinceLastWeek < 0
                ? "text-rose-400"
                : "text-slate-400"
            }`}
          >
            {stats.sinceLastWeek >= 0 ? "+" : ""}
            {stats.sinceLastWeek.toFixed(1)}%
          </div>
        </div>

        <div>
          <span className="text-xs text-muted-foreground">Top social</span>
          <div className="text-2xl font-extrabold">
            {stats.topSocial}: {formatNumber(stats.topValue)}
          </div>
        </div>
      </div>

      {/* Pie / Donut */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <RechartsTooltip
              formatter={(value: number, name: string) =>
                `${formatNumber(value)} ${metricLabel} (${(
                  (value / totalValue) *
                  100
                ).toFixed(0)}%)`
              }
              contentStyle={{
                backgroundColor: tooltipBg,
                color: tooltipText,
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: tooltipText }}
            />

            <RechartsLegend />

            <Pie
              data={displayedData}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="80%"
              onClick={(d) => setActiveCategory(d.name)}
              activeIndex={
                activeCategory
                  ? data.findIndex((d) => d.name === activeCategory)
                  : undefined
              }
            >
              {displayedData.map((c) => (
                <Cell
                  key={c.name}
                  fill={c.fill}
                  opacity={
                    !activeCategory || c.name === activeCategory ? 1 : 0.3
                  }
                />
              ))}
            </Pie>

            {/* Center label */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="cursor-pointer"
              onClick={() => setActiveCategory(null)}
            >
              <tspan className="fill-foreground text-2xl font-extrabold">
                {formatNumber(activeValue)}
              </tspan>
              <tspan
                x="50%"
                dy="1.4em"
                className="fill-muted-foreground text-xs"
              >
                {activeCategory ?? "All socials"}
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground text-center">
        {activeCategory
          ? "Click center to reset"
          : "Click a slice to explore deeper"}
      </p>
    </div>
  );
}