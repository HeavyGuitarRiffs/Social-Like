// lib/socials/kick.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncKick(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { access_token, user_id } = account as unknown as {
    access_token: string;
    user_id: string;
  };

  if (!access_token) {
    return {
      platform: "kick",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshKickTokenIfNeeded(
    account as unknown as KickAccount,
    supabase
  );

  const profile = await fetchKickProfile(refreshed.access_token);
  const posts = await fetchKickStreams(refreshed.access_token);

  const normalizedProfile = normalizeKickProfile(profile);
  const normalizedPosts = posts.map(normalizeKickStream);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "kick",
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
    platform: "kick",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type KickAccount = {
  access_token: string;
  user_id: string;
};

type RawKickProfile = {
  username?: string;
  avatar?: string;
  follower_count?: number;
};

type RawKickStream = {
  id: string;
  title?: string;
  thumbnail_url?: string;
  viewer_count?: number;
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

async function refreshKickTokenIfNeeded(
  account: KickAccount,
  supabase: SupabaseClient<Database>
): Promise<KickAccount> {
  return account; // placeholder logic
}

async function fetchKickProfile(
  accessToken: string
): Promise<RawKickProfile> {
  return {
    username: "Placeholder Streamer",
    avatar: "",
    follower_count: 0,
  };
}

async function fetchKickStreams(
  accessToken: string
): Promise<RawKickStream[]> {
  return [
    {
      id: "1",
      title: "Placeholder Kick Stream",
      thumbnail_url: "",
      viewer_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeKickProfile(
  raw: RawKickProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.follower_count ?? 0,
  };
}

function normalizeKickStream(
  raw: RawKickStream
): NormalizedPost {
  return {
    platform: "kick",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.viewer_count ?? 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}