//app\dashboard\linktree\components\ClicksCharts.tsx
"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { createClient } from "@/lib/supabase/client";
import {
  ChartWrapper,
  type ChartWrapperRenderProps,
} from "../../analytics/components/ChartWrapper";
import type { DateRangeValue } from "../../analytics/components/DateRangePicker";

type ChartProps = {
  range: DateRangeValue;
  platforms: string[];
  preview?: boolean;
};

type ClickRow = {
  date: string;
  platform: string;
  clicks: number;
  user_id: string;
};

type AreaPoint = {
  date: string;
  total: number;
  [platform: string]: number | string;
};

type BarPoint = {
  name: string;
  clicks: number;
};

export default function ClicksCharts({
  range,
  platforms,
  preview = false,
}: ChartProps) {
  const supabase = createClient();

  const [rows, setRows] = React.useState<ClickRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  // -------------------------
  // PREVIEW MODE MOCK DATA
  // -------------------------
  const previewRows: ClickRow[] = [
    {
      date: "2025-01-01",
      platform: "instagram",
      clicks: 40,
      user_id: "demo",
    },
    {
      date: "2025-01-01",
      platform: "tiktok",
      clicks: 22,
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "instagram",
      clicks: 55,
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "youtube",
      clicks: 31,
      user_id: "demo",
    },
  ];

  // -------------------------
  // LOAD DATA
  // -------------------------
  React.useEffect(() => {
    if (preview) {
      queueMicrotask(() => {
        setRows(previewRows);
        setLoading(false);
      });
      return;
    }

    async function load() {
      const { data, error } = await supabase
        .from("linktree_clicks_daily")
        .select("date, platform, clicks, user_id")
        .in("platform", platforms)
        .order("date", { ascending: true });

      if (!error && data) {
        setRows(data as ClickRow[]);
      }

      setLoading(false);
    }

    load();
  }, [supabase, platforms, range, preview]);

  // Build time-series data
  const buildAreaData = (selectedPlatforms: string[]): AreaPoint[] => {
    const grouped: Record<string, AreaPoint> = {};

    rows.forEach((row) => {
      if (!selectedPlatforms.includes(row.platform)) return;

      const key = row.date;
      if (!grouped[key]) {
        grouped[key] = { date: key, total: 0 };
      }

      grouped[key][row.platform] =
        ((grouped[key][row.platform] as number | undefined) ?? 0) +
        row.clicks;

      grouped[key].total += row.clicks;
    });

    return Object.values(grouped);
  };

  // Build bar chart data
  const buildBarData = (
    mode: "total" | "platforms",
    selectedPlatforms: string[]
  ): BarPoint[] => {
    const byPlatform: Record<string, number> = {};

    rows.forEach((row) => {
      if (!selectedPlatforms.includes(row.platform)) return;

      byPlatform[row.platform] =
        (byPlatform[row.platform] ?? 0) + row.clicks;
    });

    return Object.entries(byPlatform).map(([name, clicks]) => ({
      name,
      clicks,
    }));
  };

  if (loading) {
    return (
      <div className="h-[320px] w-full bg-muted animate-pulse rounded-md" />
    );
  }

  return (
    <ChartWrapper title="Link Clicks" platforms={platforms}>
      {({ chartType, mode, selectedPlatforms }: ChartWrapperRenderProps) => {
        if (chartType === "area") {
          const data = buildAreaData(selectedPlatforms);

          const activeSeries =
            data.length > 0
              ? Object.keys(data[0]).filter(
                  (k) => k !== "date" && k !== "total"
                )
              : [];

          return (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />

                  {/* Total */}
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />

                  {/* Platforms */}
                  {activeSeries.map((platform, i) => (
                    <Area
                      key={platform}
                      type="monotone"
                      dataKey={platform}
                      stroke={`var(--chart-${(i % 5) + 2})`}
                      fill={`var(--chart-${(i % 5) + 2})`}
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        }

        // Bar chart
        const barData = buildBarData(mode, selectedPlatforms);

        return (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar
                  dataKey="clicks"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }}
    </ChartWrapper>
  );
}