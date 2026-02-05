// lib/socials/dailymotion.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncDailymotion(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "dailymotion",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshDailymotionTokenIfNeeded(
    account as unknown as DailymotionAccount,                 // <-- Dailymotion-specific fields
    supabase
  );

  const profile = await fetchDailymotionProfile(refreshed.access_token);
  const posts = await fetchDailymotionVideos(refreshed.access_token);

  const normalizedProfile = normalizeDailymotionProfile(profile);
  const normalizedPosts = posts.map(normalizeDailymotionVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "dailymotion",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(
      normalizedPosts.map((p) => ({
        ...p,
        user_id,
      }))
    );
  }

  return {
    platform: "dailymotion",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type DailymotionAccount = {
  access_token: string;
  user_id: string;
};

type RawDailymotionProfile = {
  username?: string;
  avatar_720_url?: string;
  fans_total?: number;
};

type RawDailymotionPost = {
  id: string;
  title?: string;
  thumbnail_url?: string;
  views_total?: number;
  comments_total?: number;
  created_time?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
  followers: number;
};

type NormalizedPost = {
  platform: string;
  post_id: string;
  caption: string;
  media_url: string;
  likes: number;
  comments: number;
  posted_at: string;
};

/* -----------------------------
   Helpers
------------------------------*/

async function refreshDailymotionTokenIfNeeded(
  account: DailymotionAccount,
  supabase: SupabaseClient<Database>
): Promise<DailymotionAccount> {
  return account; // placeholder logic
}

async function fetchDailymotionProfile(
  accessToken: string
): Promise<RawDailymotionProfile> {
  return {
    username: "Placeholder DM User",
    avatar_720_url: "",
    fans_total: 0,
  };
}

async function fetchDailymotionVideos(
  accessToken: string
): Promise<RawDailymotionPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Dailymotion Video",
      thumbnail_url: "",
      views_total: 0,
      comments_total: 0,
      created_time: new Date().toISOString(),
    },
  ];
}

function normalizeDailymotionProfile(
  raw: RawDailymotionProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_720_url ?? "",
    followers: raw.fans_total ?? 0,
  };
}

function normalizeDailymotionVideo(
  raw: RawDailymotionPost
): NormalizedPost {
  return {
    platform: "dailymotion",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.views_total ?? 0,
    comments: raw.comments_total ?? 0,
    posted_at: raw.created_time ?? new Date().toISOString(),
  };
}