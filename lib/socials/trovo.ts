// lib/socials/trovo.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncTrovo(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    access_token,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    access_token: string;
  };

  if (!access_token) {
    return {
      platform: "trovo",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  const profile = await fetchTrovoProfile(access_token);
  const posts = await fetchTrovoStreams(access_token);

  const normalizedProfile = normalizeTrovoProfile(profile);
  const normalizedPosts = posts.map(normalizeTrovoStream);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "trovo",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Trovo does not expose following count
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
    platform: "trovo",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawTrovoProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawTrovoStream = {
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

async function fetchTrovoProfile(
  accessToken: string
): Promise<RawTrovoProfile> {
  return {
    username: "Placeholder Trovo Streamer",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchTrovoStreams(
  accessToken: string
): Promise<RawTrovoStream[]> {
  return [
    {
      id: "1",
      title: "Placeholder Trovo Stream",
      thumbnail_url: "",
      viewers: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTrovoProfile(
  raw: RawTrovoProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeTrovoStream(
  raw: RawTrovoStream
): NormalizedPost {
  return {
    platform: "trovo",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.viewers ?? 0, // viewers = likes in your schema
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}