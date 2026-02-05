// lib/socials/bigolive.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncBigoLive(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "bigolive",
      updated: false,
      error: "Missing access token",
    };
  }

  const profile = await fetchBigoLiveProfile(access_token);
  const posts = await fetchBigoLiveStreams(access_token);

  const normalizedProfile = normalizeBigoLiveProfile(profile);
  const normalizedPosts = posts.map(normalizeBigoLiveStream);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "bigolive",
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
    platform: "bigolive",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawBigoLiveProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawBigoLivePost = {
  id: string;
  title?: string;
  thumbnail_url?: string;
  viewers?: number;
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

async function fetchBigoLiveProfile(
  accessToken: string
): Promise<RawBigoLiveProfile> {
  return {
    username: "Placeholder BigoLive Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchBigoLiveStreams(
  accessToken: string
): Promise<RawBigoLivePost[]> {
  return [
    {
      id: "1",
      title: "Placeholder BigoLive Stream",
      thumbnail_url: "",
      viewers: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeBigoLiveProfile(
  raw: RawBigoLiveProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeBigoLiveStream(
  raw: RawBigoLivePost
): NormalizedPost {
  return {
    platform: "bigolive",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.viewers ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}