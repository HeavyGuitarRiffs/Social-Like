// lib/socials/podbean.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncPodbean(
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
      platform: "podbean",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Podbean refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshPodbeanTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchPodbeanProfile(refreshed.access_token);
  const posts = await fetchPodbeanEpisodes(refreshed.access_token);

  const normalizedProfile = normalizePodbeanProfile(profile);
  const normalizedPosts = posts.map(normalizePodbeanEpisode);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "podbean",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Podbean does not expose following count
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
    platform: "podbean",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawPodbeanProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawPodbeanEpisode = {
  id: string;
  title?: string;
  audio_url?: string;
  plays?: number;
  comments?: number;
  published_at?: string;
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

async function refreshPodbeanTokenIfNeeded(
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

async function fetchPodbeanProfile(
  accessToken: string
): Promise<RawPodbeanProfile> {
  return {
    username: "Placeholder Podbean Podcaster",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchPodbeanEpisodes(
  accessToken: string
): Promise<RawPodbeanEpisode[]> {
  return [
    {
      id: "1",
      title: "Placeholder Podbean Episode",
      audio_url: "",
      plays: 0,
      comments: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizePodbeanProfile(
  raw: RawPodbeanProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizePodbeanEpisode(
  raw: RawPodbeanEpisode
): NormalizedPost {
  return {
    platform: "podbean",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.audio_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}