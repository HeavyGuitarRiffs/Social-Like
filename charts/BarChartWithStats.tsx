//components\charts\BarChartWithStats.tsx

"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import { TimeSeriesPoint } from "./MetricChart";
import { ChartLegend } from "./ChartLegend";
import { ChartStats } from "./ChartStats";
import { useTheme } from "next-themes";

type Props = {
  data: TimeSeriesPoint[];
  metricLabel: string;
};

export function BarChartWithStats({ data, metricLabel }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme-aware colors
  const textColor = isDark ? "#ffffff" : "#0B1020";
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const tooltipBg = isDark ? "#0F172A" : "#ffffff";
  const tooltipText = isDark ? "#ffffff" : "#0B1020";

  return (
    <div className="w-full h-full flex flex-col gap-6">

      {/* Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="date" stroke={textColor} />
            <YAxis stroke={textColor} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                color: tooltipText,
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: tooltipText }}
            />
            <Bar
              dataKey="value"
              fill="#22C55E"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + stats */}
      <div className="space-y-2">
        <ChartLegend data={data} label={metricLabel} />
        <ChartStats data={data} />
      </div>

    </div>
  );
}