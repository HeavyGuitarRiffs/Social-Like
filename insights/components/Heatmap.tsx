//app\dashboard\insights\Heatmap.tsx

"use client";

import React from "react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import type { Database } from "@/supabase/types";

type HourlyRow = Database["public"]["Tables"]["linktree_clicks_hourly"]["Row"];

type HeatmapCell = {
  day: string;
  hour: number;
  clicks: number;
};

type HeatmapProps = {
  linkId: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function Heatmap({ linkId }: HeatmapProps) {
  const supabase = createClient();
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("linktree_clicks_hourly")
        .select("date, hour, clicks, link_id")
        .eq("link_id", linkId)
        .order("date", { ascending: true })
        .returns<Pick<HourlyRow, "date" | "hour" | "clicks" | "link_id">[]>();

      if (error || !data) {
        setLoading(false);
        return;
      }

      const formatted: HeatmapCell[] = data.map((row) => ({
        day: format(new Date(row.date), "EEE"),
        hour: row.hour,
        clicks: row.clicks ?? 0,
      }));

      setCells(formatted);
      setLoading(false);
    };

    load();
  }, [linkId, supabase]);

  if (loading) {
    return (
      <div className="w-full h-[200px] bg-muted animate-pulse rounded-md" />
    );
  }

  if (!cells.length) {
    return (
      <div className="w-full h-[200px] border rounded-md flex items-center justify-center text-sm text-muted-foreground">
        No hourly data yet
      </div>
    );
  }

  const days = Array.from(new Set(cells.map((c) => c.day)));
  const maxClicks = Math.max(...cells.map((c) => c.clicks), 1);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Hourly Heatmap</div>

      <div className="overflow-x-auto">
        <div
          className="grid"
          style={{ gridTemplateColumns: `80px repeat(24, 1fr)` }}
        >
          <div></div>
          {HOURS.map((h) => (
            <div key={h} className="text-center text-xs text-muted-foreground">
              {h}
            </div>
          ))}

          {days.map((day) => (
            <React.Fragment key={day}>
              <div className="flex items-center text-sm font-medium pr-2">
                {day}
              </div>

              {HOURS.map((hour) => {
                const cell = cells.find((c) => c.day === day && c.hour === hour);
                const clicks = cell?.clicks ?? 0;

                const intensity = clicks / maxClicks;
                const bg = `rgba(99, 102, 241, ${0.1 + intensity * 0.6})`;

                return (
                  <div
                    key={`${day}-${hour}`}
                    className="h-6 border border-transparent hover:border-muted transition-colors"
                    style={{
                      backgroundColor: clicks ? bg : "rgba(0,0,0,0.05)",
                    }}
                    title={`${day} @ ${hour}:00 — ${clicks} clicks`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}