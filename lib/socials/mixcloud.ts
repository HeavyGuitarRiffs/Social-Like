// lib/socials/mixcloud.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncMixcloud(
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
      platform: "mixcloud",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Mixcloud does not support refresh tokens, but we keep the signature consistent
  const refreshed = await refreshMixcloudTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchMixcloudProfile(refreshed.access_token);
  const posts = await fetchMixcloudShows(refreshed.access_token);

  const normalizedProfile = normalizeMixcloudProfile(profile);
  const normalizedPosts = posts.map(normalizeMixcloudShow);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "mixcloud",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Mixcloud does not expose following count
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
    platform: "mixcloud",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawMixcloudProfile = {
  name?: string;
  pictures?: { large?: string };
  follower_count?: number;
};

type RawMixcloudShow = {
  id: string;
  name?: string;
  pictures?: { large?: string };
  plays?: number;
  comments?: number;
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

async function refreshMixcloudTokenIfNeeded(
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

async function fetchMixcloudProfile(
  accessToken: string
): Promise<RawMixcloudProfile> {
  return {
    name: "Placeholder Mixcloud DJ",
    pictures: { large: "" },
    follower_count: 0,
  };
}

async function fetchMixcloudShows(
  accessToken: string
): Promise<RawMixcloudShow[]> {
  return [
    {
      id: "1",
      name: "Placeholder Mixcloud Show",
      pictures: { large: "" },
      plays: 0,
      comments: 0,
      created_time: new Date().toISOString(),
    },
  ];
}

function normalizeMixcloudProfile(
  raw: RawMixcloudProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.pictures?.large ?? "",
    followers: raw.follower_count ?? 0,
  };
}

function normalizeMixcloudShow(raw: RawMixcloudShow): NormalizedPost {
  return {
    platform: "mixcloud",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.pictures?.large ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_time ?? new Date().toISOString(),
  };
}