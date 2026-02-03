"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useTheme } from "next-themes";

/* -------------------- Types -------------------- */
type SocialMetrics = {
  posts: number;
  followers: number;
  comments: number;
  replies: number;
  likes: number;
};

type RadarPoint = {
  metric: string;
  score: number;
};

type Props = {
  userId?: string;
};

type MetricsBySocial = Record<string, SocialMetrics>;

/* -------------------- Constants -------------------- */
const AXES: (keyof SocialMetrics)[] = [
  "posts",
  "followers",
  "comments",
  "replies",
  "likes",
];

const SCALE_OPTIONS = [10, 100, 1000, 10000, 100000, 1000000];

/* -------------------- Smart Number Formatter -------------------- */
function formatNumber(n: number) {
  if (n >= 10_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 100_000) return (n / 1_000).toFixed(0) + "k";
  if (n >= 10_000) return (n / 1_000).toFixed(1) + "k";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toString();
}

/* -------------------- Color Logic -------------------- */
function getColorForValue(value: number) {
  if (value >= 1_000_000) return "#EC4899"; // pink
  if (value >= 100_000) return "#FBBF24"; // amber
  if (value >= 10_000) return "#3B82F6"; // blue
  if (value >= 1_000) return "#34D399"; // green
  if (value >= 100) return "#F87171"; // red
  return "#A78BFA"; // purple
}

/* -------------------- Component -------------------- */
export function RadarChartWithStats({ userId }: Props) {
  const [connectedSocials, setConnectedSocials] = useState<string[]>([]);
  const [metricsBySocial, setMetricsBySocial] = useState<MetricsBySocial>({});
  const [viewMode, setViewMode] = useState<"total" | string>("total");
  const [scale, setScale] = useState<number>(1000);
  const [isolatedAxis, setIsolatedAxis] =
    useState<keyof SocialMetrics | null>(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tooltipBg = isDark ? "#0F172A" : "#ffffff";
  const tooltipText = isDark ? "#ffffff" : "#0B1020";

  /* -------------------- Supabase -------------------- */
  const supabase: SupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /* -------------------- Fetch connected socials -------------------- */
  useEffect(() => {
    if (!userId) return;

    supabase
      .from("social_accounts")
      .select("platform")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) setConnectedSocials(data.map((a) => a.platform));
      });
  }, [userId]);

  /* -------------------- Fetch metrics -------------------- */
  useEffect(() => {
    if (!userId || !connectedSocials.length) return;

    supabase
      .from("social_metrics")
      .select("platform, posts, followers, comments, replies, likes")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!data) return;

        const map: MetricsBySocial = {};
        data.forEach((row: SocialMetrics & { platform: string }) => {
          map[row.platform] = row;
        });

        setMetricsBySocial(map);
      });
  }, [userId, connectedSocials]);

  /* -------------------- Prepare radar data -------------------- */
  const radarData: RadarPoint[] = useMemo(() => {
    const build = (metrics: SocialMetrics) =>
      AXES.map((axis) => ({
        metric: axis.charAt(0).toUpperCase() + axis.slice(1),
        score:
          isolatedAxis && isolatedAxis !== axis
            ? 0
            : Math.min(metrics[axis] || 0, scale),
      }));

    // Fallback for mock mode
    if (!userId || Object.keys(metricsBySocial).length === 0) {
      return build({
        posts: 500,
        followers: 800,
        comments: 400,
        replies: 300,
        likes: 700,
      });
    }

    if (viewMode === "total") {
      const total = { posts: 0, followers: 0, comments: 0, replies: 0, likes: 0 };
      connectedSocials.forEach((s) => {
        const m = metricsBySocial[s];
        if (!m) return;
        AXES.forEach((a) => (total[a] += m[a]));
      });
      return build(total);
    }

    return build(
      metricsBySocial[viewMode] || {
        posts: 0,
        followers: 0,
        comments: 0,
        replies: 0,
        likes: 0,
      }
    );
  }, [metricsBySocial, connectedSocials, viewMode, scale, userId, isolatedAxis]);

  /* -------------------- Color -------------------- */
  const radarFillColor = useMemo(() => {
    return getColorForValue(Math.max(...radarData.map((d) => d.score)));
  }, [radarData]);

  /* -------------------- Render -------------------- */
  return (
    <div className="space-y-4">
      {/* SCALE CONTROLS */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SCALE_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              scale === s
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted/70"
            }`}
          >
            {s >= 1_000_000 ? `${s / 1_000_000}M` : s.toLocaleString()}
          </button>
        ))}
      </div>

      {/* AXIS STATS */}
      <div className="grid grid-cols-5 gap-2">
        {AXES.map((axis, i) => {
          const value = radarData[i]?.score ?? 0;
          return (
            <button
              key={axis}
              onClick={() =>
                setIsolatedAxis(isolatedAxis === axis ? null : axis)
              }
              className={`rounded p-2 text-left transition-all ${
                isolatedAxis === axis ? "ring-2 ring-primary scale-105" : ""
              }`}
            >
              <div className="text-xs text-muted-foreground">
                {axis.toUpperCase()}
              </div>
              <div className="font-bold">{formatNumber(value)}</div>
            </button>
          );
        })}
      </div>

      {/* RADAR */}
      <div className="w-full h-64">
        <ResponsiveContainer>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis domain={[0, scale]} />
            <RechartsTooltip
              formatter={(v: number) => formatNumber(v)}
              contentStyle={{
                backgroundColor: tooltipBg,
                color: tooltipText,
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: tooltipText }}
            />
            <Radar
              dataKey="score"
              stroke={radarFillColor}
              fill={radarFillColor}
              fillOpacity={0.6}
              isAnimationActive
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}