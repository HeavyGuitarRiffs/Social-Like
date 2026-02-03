"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TimeSeriesPoint } from "./MetricChart";
import { ChartLegend } from "./ChartLegend";
import { ChartStats } from "./ChartStats";
import { useTheme } from "next-themes";

type Props = {
  data: TimeSeriesPoint[];
  metricLabel: string;
};

export function AreaChartWithStats({ data, metricLabel }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Unified theme tokens
  const textColor = isDark ? "#ffffff" : "#0B1020";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const tooltipBg = isDark ? "#0F172A" : "#ffffff";
  const tooltipText = isDark ? "#ffffff" : "#0B1020";

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} vertical={false} />

            <XAxis
              dataKey="date"
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <YAxis
              stroke={textColor}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <RechartsTooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                color: tooltipText,
                borderRadius: "8px",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid rgba(0,0,0,0.1)",
                boxShadow: isDark
                  ? "0 4px 12px rgba(0,0,0,0.4)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: tooltipText }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366F1"
              strokeWidth={2}
              fill="#6366F1"
              fillOpacity={0.25}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <ChartLegend data={data} label={metricLabel} />
      <ChartStats data={data} big />
    </div>
  );
}