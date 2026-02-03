// app/api/socials/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server-client";

type SocialInput = {
  id: string;
  handle: string;
  enabled: boolean;
  linktree?: boolean;
  metrics?: {
    power_level: number;
  };
};

type RequestBody = {
  user_id: string;
  socials: SocialInput[];
};

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { user_id, socials } = body;

    const supabase = await createServerSupabase();

    for (const social of socials) {
      if (!social.handle) continue;

      // 1) user_socials (typed correctly)
      const { error: socialError } = await supabase
        .from("user_socials")
        .upsert({
          id: social.id,
          user_id,
          handle: social.handle,
          enabled: social.enabled,
          linktree: social.linktree ?? false,
        });

      if (socialError) throw socialError;

      // 2) social_power_level (Supabase types are broken → override builder)
      if (social.metrics) {
        const powerLevelTable = supabase.from(
          "social_power_level"
        ) as unknown as {
          upsert: (values: {
            social_id: string;
            power_level: number;
          }) => Promise<{ error: Error | null }>;
        };

        const { error } = await powerLevelTable.upsert({
          social_id: social.id,
          power_level: social.metrics.power_level,
        });

        if (error) throw error;
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (err) {
    console.error("Save socials error:", err);

    return NextResponse.json(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
