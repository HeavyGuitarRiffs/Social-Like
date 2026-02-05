// lib/socials/truthsocial.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncTruthSocial(
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
      platform: "truthsocial",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Truth Social refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshTruthSocialTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchTruthSocialProfile(refreshed.access_token);
  const posts = await fetchTruthSocialPosts(refreshed.access_token);

  const normalizedProfile = normalizeTruthSocialProfile(profile);
  const normalizedPosts = posts.map(normalizeTruthSocialPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "truthsocial",
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
    platform: "truthsocial",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawTruthSocialProfile = {
  username?: string;
  avatar_url?: string;
  followers_count?: number;
  following_count?: number;
};

type RawTruthSocialPost = {
  id: string;
  content?: string;
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

async function refreshTruthSocialTokenIfNeeded(
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

async function fetchTruthSocialProfile(
  accessToken: string
): Promise<RawTruthSocialProfile> {
  return {
    username: "Placeholder Truth User",
    avatar_url: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchTruthSocialPosts(
  accessToken: string
): Promise<RawTruthSocialPost[]> {
  return [
    {
      id: "1",
      content: "Placeholder Truth Post",
      media_url: "",
      like_count: 0,
      reply_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTruthSocialProfile(
  raw: RawTruthSocialProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeTruthSocialPost(
  raw: RawTruthSocialPost
): NormalizedPost {
  return {
    platform: "truthsocial",
    post_id: raw.id,
    caption: raw.content ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.reply_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}