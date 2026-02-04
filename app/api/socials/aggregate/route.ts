// app/api/socials/aggregate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // 1. Fetch all raw activity for this user
    const { data: events, error } = await supabase
      .from("social_activity")
      .select("*")
      .eq("user_id", user_id);

    if (error) throw error;

    const dailyMap = new Map<
      string,
      {
        comments: number;
        posts: number;
        likes: number;
        sessions: number;
        totalTime: number;
      }
    >();

    const totalsMap = new Map<
      string,
      {
        comments: number;
        posts: number;
        likes: number;
        sessions: number;
        totalTime: number;
      }
    >();

    for (const e of events ?? []) {
      const platform = e.platform;
      const date = new Date(e.event_timestamp)
        .toISOString()
        .slice(0, 10);

      const dailyKey = `${platform}_${date}`;

      if (!dailyMap.has(dailyKey)) {
        dailyMap.set(dailyKey, {
          comments: 0,
          posts: 0,
          likes: 0,
          sessions: 0,
          totalTime: 0,
        });
      }

      if (!totalsMap.has(platform)) {
        totalsMap.set(platform, {
          comments: 0,
          posts: 0,
          likes: 0,
          sessions: 0,
          totalTime: 0,
        });
      }

      const daily = dailyMap.get(dailyKey)!;
      const total = totalsMap.get(platform)!;

      switch (e.event_type) {
        case "comment":
          daily.comments++;
          total.comments++;
          break;

        case "post":
          daily.posts++;
          total.posts++;
          break;

        case "like":
          daily.likes++;
          total.likes++;
          break;

        case "session_start":
          daily.sessions++;
          total.sessions++;
          break;

        case "session_end": {
          const duration =
            (e.metadata as { duration_seconds?: number })
              ?.duration_seconds ?? 0;

          daily.totalTime += duration;
          total.totalTime += duration;
          break;
        }
      }
    }

    // 3. Write daily metrics
    for (const [key, metrics] of dailyMap.entries()) {
      const [platform, date] = key.split("_");

      const avgSession =
        metrics.sessions > 0
          ? metrics.totalTime / metrics.sessions
          : 0;

      await supabase.from("social_metrics_daily").upsert({
        user_id,
        platform,
        date,
        comments_count: metrics.comments,
        posts_count: metrics.posts,
        likes_count: metrics.likes,
        sessions_count: metrics.sessions,
        total_time_seconds: metrics.totalTime,
        avg_session_seconds: avgSession,
      });
    }

    // 4. Write lifetime totals
    for (const [platform, metrics] of totalsMap.entries()) {
      await supabase.from("social_metrics_totals").upsert({
        user_id,
        platform,
        comments_count: metrics.comments,
        posts_count: metrics.posts,
        likes_count: metrics.likes,
        sessions_count: metrics.sessions,
        total_time_seconds: metrics.totalTime,
      });
    }

    return NextResponse.json({ status: "aggregated" });
  } catch (err) {
    console.error("Aggregate socials error:", err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}