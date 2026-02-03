//app\dashboard\insights\components\FullSparkline.tsx

"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/supabase/types";

type LinktreeClicksDailyRow =
  Database["public"]["Tables"]["linktree_clicks_daily"]["Row"];

type SparkPoint = {
  date: string;
  clicks: number;
};

type FullSparklineProps = {
  linkId: string;
  height?: number;
};

export function FullSparkline({ linkId, height = 120 }: FullSparklineProps) {
  const supabase = createClient();
  const [data, setData] = useState<SparkPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: rows, error } = await supabase
        .from("linktree_clicks_daily")
        .select("date, clicks, link_id")
        .eq("link_id", linkId)
        .order("date", { ascending: true })
        .returns<
          Pick<LinktreeClicksDailyRow, "date" | "clicks" | "link_id">[]
        >();

      if (error || !rows) {
        setLoading(false);
        return;
      }

      const formatted: SparkPoint[] = rows.map((row) => ({
        date: row.date,
        clicks: row.clicks ?? 0,
      }));

      setData(formatted);
      setLoading(false);
    };

    load();
  }, [linkId, supabase]);

  if (loading) {
    return (
      <div
        className="w-full rounded-md bg-muted animate-pulse"
        style={{ height }}
      />
    );
  }

  if (!data.length) {
    return (
      <div
        className="w-full rounded-md border text-xs text-muted-foreground flex items-center justify-center"
        style={{ height }}
      >
        No clicks yet
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            minTickGap={24}
          />
          <Tooltip
            formatter={(value: number) => [`${value} clicks`, "Clicks"]}
            labelFormatter={(value: string) =>
              new Date(value).toLocaleDateString()
            }
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.18}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}