//app\dashboard\insights\components\ContentBreakdown.tsx

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

import { PlatformSelector } from "@/app/dashboard/analytics/components/PlatformSelector";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/app/dashboard/analytics/components/DateRangePicker";

import { cn } from "@/lib/utils";

type Mode = "total" | "platforms";

type EventRow = {
  platform: string;
  event_type: string;
  event_timestamp: string;
  metadata: unknown;
};

type EventMetadata = {
  post_id?: string;
  content_type?: string | null;
};

type ContentBucket = {
  type: string;
  count: number;
};

export function ContentBreakdown() {
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
  const [buckets, setBuckets] = React.useState<ContentBucket[]>([]);
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
        setBuckets([]);
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
        .gte("event_timestamp", fromIso);

      if (!events || events.length === 0) {
        setBuckets([]);
        setLoading(false);
        return;
      }

      const map: Record<string, number> = {};

      (events as EventRow[]).forEach((row) => {
        const meta = row.metadata as EventMetadata;
        const type = meta.content_type ?? "unknown";

        map[type] = (map[type] ?? 0) + 1;
      });

      const result: ContentBucket[] = Object.entries(map)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      setBuckets(result);
      setLoading(false);
    }

    load();
  }, [supabase, dateRange]);

  const visibleBuckets = React.useMemo(() => {
    if (mode === "total") return buckets;
    if (selectedPlatforms.length === 0) return buckets;
    return buckets;
  }, [mode, buckets, selectedPlatforms]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <CardTitle>Content Breakdown</CardTitle>
          <CardDescription>
            Distribution of your content types across connected platforms
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
            Loading content breakdown…
          </div>
        )}

        {!loading && visibleBuckets.length === 0 && (
          <div className="py-6 text-sm text-muted-foreground">
            No content detected in this range.
          </div>
        )}

        {!loading && visibleBuckets.length > 0 && (
          <div className="space-y-3">
            {visibleBuckets.map((bucket) => (
              <div
                key={bucket.type}
                className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
              >
                <div className="font-medium capitalize">
                  {bucket.type.replace(/_/g, " ")}
                </div>

                <div className="text-xs font-medium bg-muted px-3 py-1 rounded-full">
                  {bucket.count}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

