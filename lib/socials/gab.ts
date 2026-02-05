// lib/socials/gab.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncGab(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { access_token, user_id } = account as unknown as {
    access_token: string;
    user_id: string;
  };

  if (!access_token) {
    return {
      platform: "gab",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshGabTokenIfNeeded(
    account as unknown as GabAccount,
    supabase
  );

  const profile = await fetchGabProfile(refreshed.access_token);
  const posts = await fetchGabPosts(refreshed.access_token);

  const normalizedProfile = normalizeGabProfile(profile);
  const normalizedPosts = posts.map(normalizeGabPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "gab",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
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
    platform: "gab",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type GabAccount = {
  access_token: string;
  user_id: string;
};

type RawGabProfile = {
  username?: string;
  avatar_url?: string;
  followers_count?: number;
  following_count?: number;
};

type RawGabPost = {
  id: string;
  body?: string;
  media_url?: string;
  like_count?: number;
  reply_count?: number;
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

async function refreshGabTokenIfNeeded(
  account: GabAccount,
  supabase: SupabaseClient<Database>
): Promise<GabAccount> {
  return account; // placeholder logic
}

async function fetchGabProfile(
  accessToken: string
): Promise<RawGabProfile> {
  return {
    username: "Placeholder Gab User",
    avatar_url: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchGabPosts(
  accessToken: string
): Promise<RawGabPost[]> {
  return [
    {
      id: "1",
      body: "Placeholder Gab Post",
      media_url: "",
      like_count: 0,
      reply_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeGabProfile(
  raw: RawGabProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeGabPost(
  raw: RawGabPost
): NormalizedPost {
  return {
    platform: "gab",
    post_id: raw.id,
    caption: raw.body ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.reply_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}