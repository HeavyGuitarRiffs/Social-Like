//app\dashboard\linktree\components\LinkAnalyticsDevices.tsx
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

type DeviceRow = {
  date: string;
  platform: string;
  clicks: number;
  device: string | null;
  link_id: string;
  country: string | null;
  user_id: string;
};

type AreaPoint = {
  date: string;
  total: number;
  [device: string]: number | string;
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

export default function LinkAnalyticsDevices({
  range,
  platforms,
  preview = false,
}: Props) {
  const supabase = createClient();

  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [devices, setDevices] = useState<string[]>([]);

  // -------------------------
  // PREVIEW MODE MOCK DATA
  // -------------------------
  const previewRows: DeviceRow[] = [
    {
      date: "2025-01-01",
      platform: "instagram",
      clicks: 50,
      device: "iPhone",
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-01",
      platform: "tiktok",
      clicks: 30,
      device: "Android",
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "instagram",
      clicks: 60,
      device: "iPhone",
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "youtube",
      clicks: 25,
      device: "Desktop",
      link_id: "demo",
      country: "US",
      user_id: "demo",
    },
  ];

  const previewDevices = ["iPhone", "Android", "Desktop"];

  // -------------------------
  // LOAD DATA
  // -------------------------
  useEffect(() => {
    if (preview) {
      queueMicrotask(() => {
        setRows(previewRows);
        setDevices(previewDevices);
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

      const typed = data as DeviceRow[];
      setRows(typed);

      const uniqueDevices = Array.from(
        new Set(typed.map((r) => r.device).filter(Boolean))
      ) as string[];

      setDevices(uniqueDevices);
    };

    load();
  }, [platforms, range, preview]);

  // Time-series per device
  const buildAreaData = (selectedPlatforms: string[]): AreaPoint[] => {
    const grouped: Record<string, AreaPoint> = {};

    rows.forEach((row) => {
      if (!row.device) return;
      if (!selectedPlatforms.includes(row.platform)) return;

      const key = row.date;
      if (!grouped[key]) {
        grouped[key] = { date: key, total: 0 };
      }

      grouped[key][row.device] =
        ((grouped[key][row.device] as number | undefined) ?? 0) + row.clicks;

      grouped[key].total += row.clicks;
    });

    return Object.values(grouped);
  };

  // Total clicks per device
  const buildBarData = (
    mode: "total" | "platforms",
    selectedPlatforms: string[]
  ): BarPoint[] => {
    const byDevice: Record<string, number> = {};

    rows.forEach((row) => {
      if (!row.device) return;
      if (!selectedPlatforms.includes(row.platform)) return;

      byDevice[row.device] = (byDevice[row.device] ?? 0) + row.clicks;
    });

    return Object.entries(byDevice).map(([device, clicks]) => ({
      name: device,
      clicks,
    }));
  };

  return (
    <ChartWrapper title="Devices" platforms={platforms}>
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

                  {devices.map((device) => (
                    <Area
                      key={device}
                      type="monotone"
                      dataKey={device}
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
                <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }}
    </ChartWrapper>
  );
}