//app\dashboard\linktree\components\LinkAnalyticsCountries.tsx

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

type CountryRow = {
  date: string;
  platform: string;
  clicks: number;
  country: string | null;
  link_id: string;
  user_id: string;
};

type AreaPoint = {
  date: string;
  total: number;
  [country: string]: number | string;
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

export default function LinkAnalyticsCountries({
  range,
  platforms,
  preview = false,
}: Props) {
  const supabase = createClient();

  const [rows, setRows] = useState<CountryRow[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  // -------------------------
  // PREVIEW MODE MOCK DATA
  // -------------------------
  const previewRows: CountryRow[] = [
    {
      date: "2025-01-01",
      platform: "instagram",
      clicks: 40,
      country: "United States",
      link_id: "demo",
      user_id: "demo",
    },
    {
      date: "2025-01-01",
      platform: "tiktok",
      clicks: 22,
      country: "Canada",
      link_id: "demo",
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "instagram",
      clicks: 55,
      country: "United States",
      link_id: "demo",
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "youtube",
      clicks: 31,
      country: "United Kingdom",
      link_id: "demo",
      user_id: "demo",
    },
  ];

  const previewCountries = ["United States", "Canada", "United Kingdom"];

  // -------------------------
  // LOAD DATA
  // -------------------------
  useEffect(() => {
    if (preview) {
      queueMicrotask(() => {
        setRows(previewRows);
        setCountries(previewCountries);
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

      const typed = data as CountryRow[];
      setRows(typed);

      const uniqueCountries = Array.from(
        new Set(typed.map((r) => r.country).filter(Boolean))
      ) as string[];

      setCountries(uniqueCountries);
    };

    load();
  }, [platforms, range, preview]);

  // Build area chart data (time-series per country)
  const buildAreaData = (selectedPlatforms: string[]): AreaPoint[] => {
    const grouped: Record<string, AreaPoint> = {};

    rows.forEach((row) => {
      if (!row.country) return;
      if (!selectedPlatforms.includes(row.platform)) return;

      const key = row.date;
      if (!grouped[key]) {
        grouped[key] = { date: key, total: 0 };
      }

      grouped[key][row.country] =
        ((grouped[key][row.country] as number | undefined) ?? 0) +
        row.clicks;

      grouped[key].total += row.clicks;
    });

    return Object.values(grouped);
  };

  // Build bar chart data (total clicks per country)
  const buildBarData = (
    mode: "total" | "platforms",
    selectedPlatforms: string[]
  ): BarPoint[] => {
    const byCountry: Record<string, number> = {};

    rows.forEach((row) => {
      if (!row.country) return;
      if (!selectedPlatforms.includes(row.platform)) return;

      byCountry[row.country] =
        (byCountry[row.country] ?? 0) + row.clicks;
    });

    return Object.entries(byCountry).map(([country, clicks]) => ({
      name: country,
      clicks,
    }));
  };

  return (
    <ChartWrapper title="Countries" platforms={platforms}>
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

                  {countries.map((country) => (
                    <Area
                      key={country}
                      type="monotone"
                      dataKey={country}
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