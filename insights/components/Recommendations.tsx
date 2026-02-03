// app/dashboard/insights/components/Recommendations.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlatformSelector } from "@/app/dashboard/analytics/components/PlatformSelector";
import { createClient } from "@/lib/supabase/client";

type DailyRow = {
  platform: string;
  date: string;
  comments_count: number;
  posts_count: number;
  likes_count: number;
  sessions_count: number;
  total_time_seconds: number;
  avg_session_seconds: number;
};

type CreatorMetrics = {
  platform: string;
  velocity: number | null;
  momentum: number | null;
  engagement_quality: number | null;
  streak_current: number | null;
  streak_longest: number | null;
  power_score: number | null;
};

export default function Recommendations() {
  const supabase = createClient();

  const [mode, setMode] = useState<"total" | "platforms">("platforms");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // -----------------------------------------------------
  // 1. Define generateInsights BEFORE useEffect
  // -----------------------------------------------------
  const generateInsights = (
    daily: DailyRow[],
    cm: CreatorMetrics[],
    platforms: string[]
  ) => {
    const insights: string[] = [];

    platforms.forEach((platform) => {
      const pDaily = daily.filter((r) => r.platform === platform);
      if (pDaily.length < 2) return;

      const last = pDaily[pDaily.length - 1];
      const prev = pDaily[pDaily.length - 2];

      const cmRow = cm.find((c) => c.platform === platform);

      const postsDelta = last.posts_count - prev.posts_count;
      const likesDelta = last.likes_count - prev.likes_count;
      const commentsDelta = last.comments_count - prev.comments_count;
      const sessionsDelta = last.sessions_count - prev.sessions_count;

      if (postsDelta === 0) {
        insights.push(
          `${platform}: You didn’t post yesterday — even one post can boost visibility.`
        );
      }

      if (likesDelta > 0) {
        insights.push(
          `${platform}: Likes increased by ${likesDelta} — repeat the content style that performed well.`
        );
      } else if (likesDelta < 0) {
        insights.push(
          `${platform}: Likes dipped — try posting at your peak engagement time.`
        );
      }

      if (commentsDelta > 0) {
        insights.push(
          `${platform}: Comments increased — your audience is engaging more deeply.`
        );
      }

      if (sessionsDelta > 0) {
        insights.push(
          `${platform}: More people viewed your profile — capitalize with a strong CTA today.`
        );
      }

      if (cmRow) {
        if ((cmRow.velocity ?? 0) > 0.5) {
          insights.push(
            `${platform}: Your velocity is strong — momentum is building, keep posting consistently.`
          );
        }

        if ((cmRow.momentum ?? 0) < 0) {
          insights.push(
            `${platform}: Momentum is cooling — consider refreshing your content format.`
          );
        }

        if ((cmRow.engagement_quality ?? 0) > 0.7) {
          insights.push(
            `${platform}: Engagement quality is high — your audience finds your content valuable.`
          );
        }

        if ((cmRow.streak_current ?? 0) > 3) {
          insights.push(
            `${platform}: You’re on a ${cmRow.streak_current}-day posting streak — great consistency.`
          );
        }

        if ((cmRow.power_score ?? 0) > 70) {
          insights.push(
            `${platform}: Your power score is strong — you’re trending toward creator tier upgrades.`
          );
        }
      }
    });

    setRecommendations(insights);
  };

  // -----------------------------------------------------
  // 2. useEffect AFTER generateInsights
  // -----------------------------------------------------
  useEffect(() => {
    const load = async () => {
      const { data: dailyRows } = await supabase
        .from("social_metrics_daily")
        .select("*")
        .order("date", { ascending: true });

      const { data: cmRows } = await supabase
        .from("creator_metrics")
        .select("*");

      if (!dailyRows || !cmRows) return;

      const typedDaily = dailyRows as DailyRow[];
      const typedCM = cmRows as CreatorMetrics[];

      const uniquePlatforms = Array.from(
        new Set(typedDaily.map((r) => r.platform))
      );

      setPlatforms(uniquePlatforms);
      setSelectedPlatforms(uniquePlatforms);

      generateInsights(typedDaily, typedCM, uniquePlatforms);
    };

    load();
  }, []);

  // -----------------------------------------------------
  // 3. Render
  // -----------------------------------------------------
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recommendations</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <PlatformSelector
          mode={mode}
          onModeChange={setMode}
          platforms={platforms}
          selectedPlatforms={selectedPlatforms}
          onPlatformChange={setSelectedPlatforms}
        />

        <div className="space-y-3">
          {recommendations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Insights will appear once enough data is available.
            </p>
          )}

          {recommendations
            .filter((rec) =>
              mode === "total"
                ? true
                : selectedPlatforms.some((p) =>
                    rec.toLowerCase().startsWith(p)
                  )
            )
            .map((rec, i) => (
              <div
                key={i}
                className="rounded-md border p-3 text-sm bg-muted/30"
              >
                {rec}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}