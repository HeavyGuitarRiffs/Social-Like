// app/api/socials/activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const supabase = createClient();

    const payload = body.events.map((e) => ({
      user_id: e.user_id,
      platform: e.platform,
      event_type: e.event_type,
      event_timestamp: e.event_timestamp
        ? new Date(e.event_timestamp).toISOString()
        : new Date().toISOString(),
      metadata: e.metadata ?? {},
    }));

    const { error } = await supabase.from("social_activity").insert(payload);

    if (error) throw error;

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unknown error" },
      { status: 500 }
    );
  }
}