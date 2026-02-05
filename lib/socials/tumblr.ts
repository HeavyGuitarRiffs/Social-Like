// lib/socials/tumblr.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncTumblr(
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
      platform: "tumblr",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Tumblr refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshTumblrTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchTumblrProfile(refreshed.access_token);
  const posts = await fetchTumblrPosts(refreshed.access_token);

  const normalizedProfile = normalizeTumblrProfile(profile);
  const normalizedPosts = posts.map(normalizeTumblrPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "tumblr",
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
    platform: "tumblr",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawTumblrProfile = {
  name?: string;
  avatar?: string;
  followers?: number;
  following?: number;
};

type RawTumblrPost = {
  id: string;
  summary?: string;
  media_url?: string;
  note_count?: number;
  created_at?: string;
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

async function refreshTumblrTokenIfNeeded(
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

async function fetchTumblrProfile(
  accessToken: string
): Promise<RawTumblrProfile> {
  return {
    name: "Placeholder Tumblr User",
    avatar: "",
    followers: 0,
    following: 0,
  };
}

async function fetchTumblrPosts(
  accessToken: string
): Promise<RawTumblrPost[]> {
  return [
    {
      id: "1",
      summary: "Placeholder Tumblr Post",
      media_url: "",
      note_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTumblrProfile(
  raw: RawTumblrProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeTumblrPost(
  raw: RawTumblrPost
): NormalizedPost {
  return {
    platform: "tumblr",
    post_id: raw.id,
    caption: raw.summary ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.note_count ?? 0,
    comments: 0, // Tumblr does not expose comment count
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}