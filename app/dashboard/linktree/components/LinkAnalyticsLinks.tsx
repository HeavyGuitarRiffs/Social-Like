//app\dashboard\linktree\components\LinkAnalyticsLinks.tsx
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

type LinkRow = {
  date: string;
  platform: string;
  clicks: number;
  link_id: string;
  country: string | null;
  user_id: string;
};

type LinkMeta = {
  id: string;
  title: string;
};

type AreaPoint = {
  date: string;
  total: number;
  [label: string]: number | string;
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

export default function LinkAnalyticsLinks({
  range,
  platforms,
  preview = false,
}: Props) {
  const supabase = createClient();

  const [rows, setRows] = useState<LinkRow[]>([]);
  const [links, setLinks] = useState<LinkMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // PREVIEW MODE MOCK DATA
  // -------------------------
  const previewRows: LinkRow[] = [
    {
      date: "2025-01-01",
      platform: "instagram",
      clicks: 40,
      link_id: "link-1",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-01",
      platform: "tiktok",
      clicks: 22,
      link_id: "link-2",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "instagram",
      clicks: 55,
      link_id: "link-1",
      country: "US",
      user_id: "demo",
    },
    {
      date: "2025-01-02",
      platform: "youtube",
      clicks: 31,
      link_id: "link-3",
      country: "US",
      user_id: "demo",
    },
  ];

  const previewLinks: LinkMeta[] = [
    { id: "link-1", title: "My Website" },
    { id: "link-2", title: "Shop" },
    { id: "link-3", title: "YouTube Channel" },
  ];

  // -------------------------
  // LOAD DATA
  // -------------------------
  useEffect(() => {
    if (preview) {
      queueMicrotask(() => {
        setRows(previewRows);
        setLinks(previewLinks);
        setLoading(false);
      });
      return;
    }

    const load = async () => {
      const { data: clicks } = await supabase
        .from("linktree_clicks_daily")
        .select("*")
        .in("platform", platforms)
        .order("date", { ascending: true })
        .returns<LinkRow[]>();

      if (clicks) setRows(clicks);

      const { data: linkData } = await supabase
        .from("linktree_links")
        .select("id, title")
        .returns<LinkMeta[]>();

      if (linkData) setLinks(linkData);

      setLoading(false);
    };

    load();
  }, [platforms, range, preview]);

  // -------------------------
  // HELPERS
  // -------------------------
  const getLabel = (id: string) => {
    const found = links.find((l) => l.id === id);
    return found ? found.title : id;
  };

  // Time-series per link
  const buildAreaData = (selectedPlatforms: string[]): AreaPoint[] => {
    const grouped: Record<string, AreaPoint> = {};

    rows.forEach((row) => {
      if (!selectedPlatforms.includes(row.platform)) return;

      const key = row.date;
      if (!grouped[key]) {
        grouped[key] = { date: key, total: 0 };
      }

      const label = getLabel(row.link_id);

      grouped[key][label] =
        ((grouped[key][label] as number | undefined) ?? 0) + row.clicks;

      grouped[key].total += row.clicks;
    });

    return Object.values(grouped);
  };

  // Total clicks per link
  const buildBarData = (
    mode: "total" | "platforms",
    selectedPlatforms: string[]
  ): BarPoint[] => {
    const byLink: Record<string, number> = {};

    rows.forEach((row) => {
      if (!selectedPlatforms.includes(row.platform)) return;

      const label = getLabel(row.link_id);
      byLink[label] = (byLink[label] ?? 0) + row.clicks;
    });

    return Object.entries(byLink).map(([label, clicks]) => ({
      name: label,
      clicks,
    }));
  };

  // -------------------------
  // RENDER
  // -------------------------
  if (loading) {
    return (
      <div className="h-[320px] w-full bg-muted animate-pulse rounded-md" />
    );
  }

  return (
    <ChartWrapper title="Links" platforms={platforms}>
      {({ chartType, mode, selectedPlatforms }: ChartWrapperRenderProps) => {
        if (chartType === "area") {
          const data = buildAreaData(selectedPlatforms);

          const activeLabels =
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

                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />

                  {activeLabels.map((label, i) => (
                    <Area
                      key={label}
                      type="monotone"
                      dataKey={label}
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