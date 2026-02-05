// lib/socials/tiktok.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncTikTok(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    access_token,
    refresh_token,
    expires_at,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
  };

  if (!access_token) {
    return {
      platform: "tiktok",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // TikTok refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshTikTokTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchTikTokProfile(refreshed.access_token);
  const posts = await fetchTikTokPosts(refreshed.access_token);

  const normalizedProfile = normalizeTikTokProfile(profile);
  const normalizedPosts = posts.map(normalizeTikTokPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "tiktok",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  /* ---------------------------------
     social_posts
  ----------------------------------*/
  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(
      normalizedPosts.map((p) => ({
        ...p,
        user_id,
        account_id,
      }))
    );
  }

  return {
    platform: "tiktok",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawTikTokProfile = {
  username?: string;
  avatar_url?: string;
  follower_count?: number;
  following_count?: number;
};

type RawTikTokPost = {
  id: string;
  description?: string;
  video_url?: string;
  like_count?: number;
  comment_count?: number;
  create_time?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
  followers: number;
  following: number;
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

async function refreshTikTokTokenIfNeeded(
  account: {
    account_id: string;
    user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
  },
  supabase: SupabaseClient<Database>
) {
  return account; // placeholder logic
}

async function fetchTikTokProfile(
  accessToken: string
): Promise<RawTikTokProfile> {
  return {
    username: "placeholder",
    avatar_url: "",
    follower_count: 0,
    following_count: 0,
  };
}

async function fetchTikTokPosts(
  accessToken: string
): Promise<RawTikTokPost[]> {
  return [
    {
      id: "1",
      description: "Placeholder TikTok",
      video_url: "",
      like_count: 0,
      comment_count: 0,
      create_time: new Date().toISOString(),
    },
  ];
}

function normalizeTikTokProfile(
  raw: RawTikTokProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.follower_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeTikTokPost(
  raw: RawTikTokPost
): NormalizedPost {
  return {
    platform: "tiktok",
    post_id: raw.id,
    caption: raw.description ?? "",
    media_url: raw.video_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.create_time ?? new Date().toISOString(),
  };
}