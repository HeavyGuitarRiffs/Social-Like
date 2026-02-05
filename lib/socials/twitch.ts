// lib/socials/twitch.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncTwitch(
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
      platform: "twitch",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Twitch refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshTwitchTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchTwitchProfile(refreshed.access_token);
  const posts = await fetchTwitchVideos(refreshed.access_token);

  const normalizedProfile = normalizeTwitchProfile(profile);
  const normalizedPosts = posts.map(normalizeTwitchVideo);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "twitch",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Twitch does not expose following count
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
    platform: "twitch",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawTwitchProfile = {
  display_name?: string;
  profile_image_url?: string;
  follower_count?: number;
};

type RawTwitchVideo = {
  id: string;
  title?: string;
  thumbnail_url?: string;
  view_count?: number;
  created_at?: string;
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

async function refreshTwitchTokenIfNeeded(
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

async function fetchTwitchProfile(
  accessToken: string
): Promise<RawTwitchProfile> {
  return {
    display_name: "placeholder",
    profile_image_url: "",
    follower_count: 0,
  };
}

async function fetchTwitchVideos(
  accessToken: string
): Promise<RawTwitchVideo[]> {
  return [
    {
      id: "1",
      title: "Placeholder Twitch VOD",
      thumbnail_url: "",
      view_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTwitchProfile(
  raw: RawTwitchProfile
): NormalizedProfile {
  return {
    username: raw.display_name ?? "",
    avatar_url: raw.profile_image_url ?? "",
    followers: raw.follower_count ?? 0,
  };
}

function normalizeTwitchVideo(
  raw: RawTwitchVideo
): NormalizedPost {
  return {
    platform: "twitch",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.view_count ?? 0,
    comments: 0, // Twitch does not expose comment count
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}