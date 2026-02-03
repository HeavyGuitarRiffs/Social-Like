//app\dashboard\linktree\components\LinkAnalyticsReferrers.tsx
"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";

import { createClient } from "@/lib/supabase/client";
import {
  ChartWrapper,
  type ChartWrapperRenderProps,
} from "@/app/dashboard/analytics/components/ChartWrapper";
import type { DateRangeValue } from "@/app/dashboard/analytics/components/DateRangePicker";

type ReferrerRow = {
  date: string;
  platform: string;
  clicks: number;
  referrer?: string | null;
  link_id: string;
  country: string | null;
  user_id: string;
};

type AreaPoint = {
  date: string;
  total: number;
  [referrer: string]: number | string;
};

type BarPoint = {
  name: string;
  clicks: number;
};

type Props = {
  range: DateRangeValue;
  platforms: string[];
  preview?: boolean;
};

export default function LinkAnalyticsReferrers({
  range,
  platforms,
  preview = false,
}: Props) {
  const supabase = createClient();

  const [rows, setRows] = useState<ReferrerRow[]>([]);
  const [referrers, setReferrers] = useState<string[]>([]);

  // -------------------------
  // PREVIEW MODE MOCK DATA
  // -------------------------
  const previewRows: ReferrerRow[] = [
    {
      date: "2025-01-01",
      platform: "instagram",
      clicks: 40,
      referrer: "instagram.com",
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-01",
      platform: "tiktok",
      clicks: 25,
      referrer: "tiktok.com",
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "instagram",
      clicks: 55,
      referrer: "instagram.com",
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "youtube",
      clicks: 30,
      referrer: "youtube.com",
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
  ];

  // -------------------------
  // LOAD DATA
  // -------------------------
  useEffect(() => {
  if (preview) {
    queueMicrotask(() => {
      setRows(previewRows);
      setReferrers(
        Array.from(
          new Set(previewRows.map((r) => r.referrer).filter(Boolean))
        ) as string[]
      );
    });
    return;
  }

  const load = async () => {
    const { data, error } = await supabase
      .from("linktree_clicks_daily")
      .select("*")
      .in("platform", platforms)
      .order("date", { ascending: true });

    if (error || !data) return;

    const typed = data as ReferrerRow[];
    setRows(typed);

    const uniqueReferrers = Array.from(
      new Set(typed.map((r) => r.referrer).filter(Boolean))
    ) as string[];
    setReferrers(uniqueReferrers);
  };

  load();
}, [platforms, range, preview]);
  // -------------------------
  // AREA DATA
  // -------------------------
  const buildAreaData = (selectedPlatforms: string[]): AreaPoint[] => {
    const grouped: Record<string, AreaPoint> = {};

    rows.forEach((row) => {
      if (!row.referrer) return;
      if (!selectedPlatforms.includes(row.platform)) return;

      const key = row.date;
      if (!grouped[key]) {
        grouped[key] = { date: key, total: 0 };
      }

      grouped[key][row.referrer] =
        ((grouped[key][row.referrer] as number | undefined) ?? 0) +
        row.clicks;

      grouped[key].total += row.clicks;
    });

    return Object.values(grouped);
  };

  // -------------------------
  // BAR DATA
  // -------------------------
  const buildBarData = (
    mode: "total" | "platforms",
    selectedPlatforms: string[]
  ): BarPoint[] => {
    const byReferrer: Record<string, number> = {};

    rows.forEach((row) => {
      if (!row.referrer) return;
      if (!selectedPlatforms.includes(row.platform)) return;

      byReferrer[row.referrer] =
        (byReferrer[row.referrer] ?? 0) + row.clicks;
    });

    return Object.entries(byReferrer).map(([referrer, clicks]) => ({
      name: referrer,
      clicks,
    }));
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <ChartWrapper title="Referrers" platforms={platforms}>
      {({ chartType, mode, selectedPlatforms }: ChartWrapperRenderProps) => {
        if (chartType === "area") {
          const data = buildAreaData(selectedPlatforms);

          return (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />

                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />

                  {referrers.map((ref) => (
                    <Area
                      key={ref}
                      type="monotone"
                      dataKey={ref}
                      strokeWidth={2}
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.12}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        }

        const barData = buildBarData(mode, selectedPlatforms);

        return (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar
                  dataKey="clicks"
                  fill="#6366f1"
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