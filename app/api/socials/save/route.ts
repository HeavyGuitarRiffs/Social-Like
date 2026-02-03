// app/api/socials/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Define the expected shape of each social link coming from the client
type SocialInput = {
  id: string;
  handle: string;
  enabled: boolean;
  linktree?: boolean;
  metrics?: { power_level: number };
};

type RequestBody = {
  user_id: string;
  socials: SocialInput[];
};

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { user_id, socials } = body;

    // IMPORTANT: use server-side Supabase client
    const supabase = createClient();

    for (const social of socials) {
      if (!social.handle) continue;

      // Upsert the social link
      const { error } = await supabase
        .from("user_socials")
        .upsert({
          id: social.id,
          user_id,
          handle: social.handle,
          enabled: social.enabled,
          linktree: social.linktree || false,
        });

      if (error) throw error;

      // Optional: upsert metrics if present
      if (social.metrics) {
        const { error: metricsError } = await supabase
          .from("social_metrics")
          .upsert({
            social_id: social.id,
            power_level: social.metrics.power_level,
          });

        if (metricsError) throw metricsError;
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Save socials error:", err.message);
      return NextResponse.json(
        { status: "error", message: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: "error", message: "Unknown error" },
      { status: 500 }
    );
  }
}