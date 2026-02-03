// app/api/socials/activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server-client";
import type { Json } from "@/supabase/types";

type ActivityEvent = {
  user_id: string;
  platform: string;
  event_type: "comment" | "post" | "like" | "session_start" | "session_end";
  event_timestamp?: string;
  metadata?: Record<string, unknown>;
};

type RequestBody = {
  events: ActivityEvent[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body?.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: "Invalid or missing events array" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();

    const payload = body.events.map((e) => ({
      user_id: e.user_id,
      platform: e.platform,
      event_type: e.event_type,
      event_timestamp: e.event_timestamp
        ? new Date(e.event_timestamp).toISOString()
        : new Date().toISOString(),
      metadata: (e.metadata ?? {}) as Json,
    }));

    const { error } = await supabase
      .from("social_activity")
      .insert(payload);

    if (error) throw error;

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Social activity error:", err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
