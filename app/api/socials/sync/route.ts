import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Modular sync engines
import { syncInstagram } from "@/lib/socials/instagram";
import { syncTikTok } from "@/lib/socials/tiktok";
import { syncYouTube } from "@/lib/socials/youtube";
import { syncTwitter } from "@/lib/socials/twitter";

export async function POST(req: Request) {
  const supabase = await createClient();

  // 1. Authenticate user (skip or modify if this is a cron job)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch connected social accounts
  const { data: accounts, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Array<Record<string, unknown>> = [];

  // 3. Loop through each platform
  for (const account of accounts ?? []) {
    try {
      let result: unknown;

      switch (account.platform) {
        case "instagram":
          result = await syncInstagram(account, supabase);
          break;
        case "tiktok":
          result = await syncTikTok(account, supabase);
          break;
        case "youtube":
          result = await syncYouTube(account, supabase);
          break;
        case "twitter":
          result = await syncTwitter(account, supabase);
          break;
        default:
          result = {
            platform: account.platform,
            skipped: true,
            reason: "Unsupported platform",
          };
      }

      results.push(result as Record<string, unknown>);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error";

      results.push({
        platform: account.platform,
        error: message,
      });
    }
  }

  // 4. Return sync summary
  return NextResponse.json({
    status: "success",
    synced: results,
    timestamp: new Date().toISOString(),
  });
}
