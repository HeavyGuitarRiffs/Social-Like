//app\dashboard\insights\components\BestTimesToPost.tsx

"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/supabase/types";;

import { DateRangePicker, type DateRangeValue } from "@/app/dashboard/analytics/components/DateRangePicker";
import { PlatformSelector } from "@/app/dashboard/analytics/components/PlatformSelector";

import { cn } from "@/lib/utils";

type Mode = "total" | "platforms";

type EventRow = {
  platform: string;
  event_type: string;
  event_timestamp: string;
  metadata: unknown;
};

type HeatmapCell = {
  day: number;
  hour: number;
  score: number;
};

export function BestTimesToPost() {
  const supabase = React.useMemo(
    () =>
      createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [dateRange, setDateRange] = React.useState<DateRangeValue>("30d");
  const [mode, setMode] = React.useState<Mode>("total");
  const [platforms, setPlatforms] = React.useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
  const [heatmap, setHeatmap] = React.useState<HeatmapCell[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    async function load(): Promise<void> {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: socials } = await supabase
        .from("connected_socials")
        .select("platform")
        .eq("user_id", user.id);

      if (!socials || socials.length === 0) {
        setPlatforms([]);
        setSelectedPlatforms([]);
        setHeatmap([]);
        setLoading(false);
        return;
      }

      const platformList = socials.map((s) => s.platform);
      setPlatforms(platformList);
      if (selectedPlatforms.length === 0) {
        setSelectedPlatforms(platformList);
      }

      const now = new Date();
      const from = new Date(now);

      const days =
        dateRange === "1d"
          ? 1
          : dateRange === "7d"
          ? 7
          : dateRange === "30d"
          ? 30
          : dateRange === "90d"
          ? 90
          : dateRange === "180d"
          ? 180
          : 365;

      from.setDate(from.getDate() - days);
      const fromIso = from.toISOString();

      const { data: events } = await supabase
        .from("creator_raw_events")
        .select("platform, event_type, event_timestamp, metadata")
        .eq("user_id", user.id)
        .in("platform", platformList)
        .gte("event_timestamp", fromIso)
        .in("event_type", ["like", "comment", "view"]);

      if (!events || events.length === 0) {
        setHeatmap([]);
        setLoading(false);
        return;
      }

      const buckets: Record<string, number> = {};

      (events as EventRow[]).forEach((row) => {
        const date = new Date(row.event_timestamp);
        const hour = date.getHours();
        const day = date.getDay();

        const key = `${day}-${hour}`;

        let weight = 0;
        if (row.event_type === "like") weight = 1;
        if (row.event_type === "comment") weight = 1;
        if (row.event_type === "view") weight = 0.25;

        buckets[key] = (buckets[key] ?? 0) + weight;
      });

      const cells: HeatmapCell[] = [];

      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const key = `${day}-${hour}`;
          cells.push({
            day,
            hour,
            score: buckets[key] ?? 0,
          });
        }
      }

      setHeatmap(cells);
      setLoading(false);
    }

    load();
  }, [supabase, dateRange]);

  const visibleHeatmap = React.useMemo(() => {
    if (mode === "total") return heatmap;
    if (selectedPlatforms.length === 0) return heatmap;
    return heatmap;
  }, [mode, heatmap, selectedPlatforms]);

  const maxScore = React.useMemo(
    () => Math.max(...visibleHeatmap.map((c) => c.score), 1),
    [visibleHeatmap]
  );

  return (
    <Card className="pt-0">
      <CardHeader className="flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <CardTitle>Best Times to Post</CardTitle>
          <CardDescription>
            When your audience is most active across connected platforms
          </CardDescription>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          <PlatformSelector
            mode={mode}
            onModeChange={setMode}
            platforms={platforms}
            selectedPlatforms={selectedPlatforms}
            onPlatformChange={setSelectedPlatforms}
          />
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading && (
          <div className="py-6 text-sm text-muted-foreground">
            Calculating best times…
          </div>
        )}

        {!loading && visibleHeatmap.length === 0 && (
          <div className="py-6 text-sm text-muted-foreground">
            Not enough engagement data yet.
          </div>
        )}

        {!loading && visibleHeatmap.length > 0 && (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-25 gap-[2px]">
              <div></div>
              {Array.from({ length: 24 }).map((_, hour) => (
                <div
                  key={hour}
                  className="text-center text-[10px] text-muted-foreground"
                >
                  {hour}
                </div>
              ))}

              {Array.from({ length: 7 }).map((_, day) => (
                <React.Fragment key={day}>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]}
                  </div>

                  {Array.from({ length: 24 }).map((_, hour) => {
                    const cell = visibleHeatmap.find(
                      (c) => c.day === day && c.hour === hour
                    );

                    const intensity = cell ? cell.score / maxScore : 0;

                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={cn(
                          "h-6 w-6 rounded-sm transition-colors",
                          intensity === 0
                            ? "bg-muted"
                            : "bg-primary/20"
                        )}
                        style={{
                          opacity: intensity === 0 ? 1 : 0.3 + intensity * 0.7,
                        }}
                      ></div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

