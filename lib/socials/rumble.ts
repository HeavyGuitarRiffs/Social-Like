// lib/socials/rumble.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncRumble(
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
      platform: "rumble",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Rumble refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshRumbleTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchRumbleProfile(refreshed.access_token);
  const posts = await fetchRumbleVideos(refreshed.access_token);

  const normalizedProfile = normalizeRumbleProfile(profile);
  const normalizedPosts = posts.map(normalizeRumbleVideo);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "rumble",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Rumble does not expose following count
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
    platform: "rumble",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawRumbleProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawRumbleVideo = {
  id: string;
  title?: string;
  thumbnail_url?: string;
  views?: number;
  comments?: number;
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

async function refreshRumbleTokenIfNeeded(
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

async function fetchRumbleProfile(
  accessToken: string
): Promise<RawRumbleProfile> {
  return {
    username: "Placeholder Rumble Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchRumbleVideos(
  accessToken: string
): Promise<RawRumbleVideo[]> {
  return [
    {
      id: "1",
      title: "Placeholder Rumble Video",
      thumbnail_url: "",
      views: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeRumbleProfile(
  raw: RawRumbleProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeRumbleVideo(
  raw: RawRumbleVideo
): NormalizedPost {
  return {
    platform: "rumble",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.views ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}