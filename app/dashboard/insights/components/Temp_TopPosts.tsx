//app\dashboard\insights\components\TopPosts.tsx

"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/supabase/types";

import { PlatformSelector } from "@/app/dashboard/analytics/components/PlatformSelector";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/app/dashboard/analytics/components/DateRangePicker";

import { cn } from "@/lib/utils";

type Mode = "total" | "platforms";

type PostRow = {
  id: string;
  user_id: string | null;
  platform: string | null;
  post_id: string | null;
  created_at: string | null;
};

type EventRow = {
  user_id: string;
  platform: string;
  event_type: string;
  event_timestamp: string;
  metadata: unknown;
};

type EventMetadata = {
  post_id?: string;
  content_type?: string | null;
};

type AggregatedPost = {
  key: string;
  id: string;
  platform: string;
  post_id: string;
  created_at: string;
  engagement: number;
  likes: number;
  comments: number;
  views: number;
  content_type?: string | null;
};

export function TopPosts() {
  const supabase = React.useMemo(
    () =>
      createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [mode, setMode] = React.useState<Mode>("total");
  const [dateRange, setDateRange] = React.useState<DateRangeValue>("30d");
  const [platforms, setPlatforms] = React.useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
  const [posts, setPosts] = React.useState<AggregatedPost[]>([]);
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
        setPosts([]);
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

      const { data: postRows } = await supabase
        .from("posts")
        .select("id, user_id, platform, post_id, created_at")
        .eq("user_id", user.id)
        .in("platform", platformList)
        .gte("created_at", fromIso)
        .order("created_at", { ascending: false });

      if (!postRows || postRows.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const postMap: Record<string, AggregatedPost> = {};

      (postRows as PostRow[]).forEach((row) => {
        if (!row.platform || !row.post_id) return;

        const key = `${row.platform}:${row.post_id}`;
        const createdAt = row.created_at ?? "";

        postMap[key] = {
          key,
          id: row.id,
          platform: row.platform,
          post_id: row.post_id,
          created_at: createdAt,
          engagement: 0,
          likes: 0,
          comments: 0,
          views: 0,
        };
      });

      const postKeys = Object.keys(postMap);
      if (postKeys.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data: events } = await supabase
        .from("creator_raw_events")
        .select("user_id, platform, event_type, event_timestamp, metadata")
        .eq("user_id", user.id)
        .in("platform", platformList)
        .gte("event_timestamp", fromIso)
        .in("event_type", ["like", "comment", "view"]);

      if (events && events.length > 0) {
        (events as EventRow[]).forEach((row) => {
          const meta = row.metadata as unknown as EventMetadata;
          const postId = meta.post_id;
          if (!postId) return;

          const key = `${row.platform}:${postId}`;
          const agg = postMap[key];
          if (!agg) return;

          if (meta.content_type && !agg.content_type) {
            agg.content_type = meta.content_type;
          }

          if (row.event_type === "like") {
            agg.likes += 1;
            agg.engagement += 1;
          } else if (row.event_type === "comment") {
            agg.comments += 1;
            agg.engagement += 1;
          } else if (row.event_type === "view") {
            agg.views += 1;
          }
        });
      }

      const aggregated = Object.values(postMap)
        .filter((p) => p.engagement > 0 || p.views > 0)
        .sort((a, b) => b.engagement - a.engagement || b.views - a.views)
        .slice(0, 10);

      setPosts(aggregated);
      setLoading(false);
    }

    load();
  }, [supabase, dateRange]);

  const visiblePosts = React.useMemo(() => {
    if (mode === "total") return posts;
    if (selectedPlatforms.length === 0) return posts;
    return posts.filter((p) => selectedPlatforms.includes(p.platform));
  }, [mode, posts, selectedPlatforms]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <CardTitle>Top Posts</CardTitle>
          <CardDescription>
            Your highest-performing posts across connected platforms
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
            Loading top posts…
          </div>
        )}

        {!loading && visiblePosts.length === 0 && (
          <div className="py-6 text-sm text-muted-foreground">
            No posts with engagement in this range yet.
          </div>
        )}

        {!loading && visiblePosts.length > 0 && (
          <div className="space-y-3">
            {visiblePosts.map((post, index) => (
              <div
                key={post.key}
                className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    #{index + 1}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {post.platform.charAt(0).toUpperCase() +
                          post.platform.slice(1)}
                      </span>
                      {post.content_type && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                          {post.content_type}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {post.post_id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <MetricPill label="Engagement" value={post.engagement} />
                  <MetricPill label="Likes" value={post.likes} />
                  <MetricPill label="Comments" value={post.comments} />
                  <MetricPill label="Views" value={post.views} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricPillProps {
  label: string;
  value: number;
}

function MetricPill({ label, value }: MetricPillProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-end rounded-full bg-muted px-3 py-1"
      )}
    >
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

