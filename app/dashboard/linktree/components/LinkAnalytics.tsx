//app\dashboard\linktree\components\LinkAnalytics.tsx
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
} from "../../analytics/components/ChartWrapper";
import { format } from "date-fns";
import type { DateRangeValue } from "@/app/dashboard/analytics/components/DateRangePicker";

type LinkClickRow = {
  date: string;
  platform: string;
  clicks: number;
  link_id: string;
  country: string | null;
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

export default function LinkAnalytics({
  range,
  platforms,
  preview = false,
}: {
  range: DateRangeValue;
  platforms: string[];
  preview?: boolean;
}) {
  const supabase = createClient();

  const [rows, setRows] = useState<LinkClickRow[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<string[]>([]);

  // -------------------------
  // PREVIEW MODE MOCK DATA
  // -------------------------
  const previewRows: LinkClickRow[] = [
    {
      date: "2025-01-01",
      platform: "instagram",
      clicks: 40,
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-01",
      platform: "tiktok",
      clicks: 22,
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "instagram",
      clicks: 55,
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "youtube",
      clicks: 31,
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
  ];

  const previewPlatforms = ["instagram", "tiktok", "youtube"];

  // -------------------------
  // LOAD DATA
  // -------------------------
  useEffect(() => {
  if (preview) {
    queueMicrotask(() => {
      setRows(previewRows);
      setAllPlatforms(previewPlatforms);
    });
    return;
  }

  const load = async () => {
    const { data, error } = await supabase
      .from("linktree_clicks_daily")
      .select("*")
      .order("date", { ascending: true });

    if (error || !data) return;

    const typed = data as LinkClickRow[];
    setRows(typed);

    const uniquePlatforms = Array.from(
      new Set(typed.map((r) => r.platform))
    );

    setAllPlatforms(uniquePlatforms);
  };

  load();
}, [preview, supabase]);

  const buildAreaData = (selectedPlatforms: string[]): AreaPoint[] => {
    const grouped: Record<string, AreaPoint> = {};

    rows.forEach((row) => {
      const key = row.date;
      if (!grouped[key]) {
        grouped[key] = { date: key, total: 0 };
      }
      if (selectedPlatforms.includes(row.platform)) {
        grouped[key][row.platform] =
          ((grouped[key][row.platform] as number | undefined) ?? 0) +
          row.clicks;
        grouped[key].total += row.clicks;
      }
    });

    return Object.values(grouped).map((d) => ({
      ...d,
      date: format(new Date(d.date), "MMM d"),
    }));
  };

  const buildBarData = (
    mode: "total" | "platforms",
    selectedPlatforms: string[]
  ): BarPoint[] => {
    if (mode === "total") {
      const total = rows
        .filter((r) => selectedPlatforms.includes(r.platform))
        .reduce((sum, r) => sum + r.clicks, 0);

      return [{ name: "Total", clicks: total }];
    }

    const byPlatform: Record<string, number> = {};

    rows.forEach((row) => {
      if (!selectedPlatforms.includes(row.platform)) return;
      byPlatform[row.platform] =
        (byPlatform[row.platform] ?? 0) + row.clicks;
    });

    return Object.entries(byPlatform).map(([platform, clicks]) => ({
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      clicks,
    }));
  };

  return (
    <ChartWrapper title="Linktree Analytics" platforms={allPlatforms}>
      {({ chartType, mode, selectedPlatforms }: ChartWrapperRenderProps) => {
        if (chartType === "area") {
          const data = buildAreaData(selectedPlatforms);

          return (
            <div className="h-[320px] w-full">
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

                  {selectedPlatforms.map((platform) => (
                    <Area
                      key={platform}
                      type="monotone"
                      dataKey={platform}
                      strokeWidth={2}
                      stroke={platformColor(platform)}
                      fill={platformColor(platform)}
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
          <div className="h-[320px] w-full">
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

function platformColor(platform: string) {
  const colors: Record<string, string> = {
    instagram: "#E1306C",
    tiktok: "#000000",
    youtube: "#FF0000",
    twitter: "#1DA1F2",
    facebook: "#1877F2",
    twitch: "#9146FF",
    default: "#6b7280",
  };
  return colors[platform] ?? colors.default;
}