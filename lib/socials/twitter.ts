// lib/socials/twitter.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncTwitter(
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
      platform: "twitter",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Twitter refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshTwitterTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchTwitterProfile(refreshed.access_token);
  const posts = await fetchTwitterPosts(refreshed.access_token);

  const normalizedProfile = normalizeTwitterProfile(profile);
  const normalizedPosts = posts.map(normalizeTwitterPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "twitter",
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
    platform: "twitter",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawTwitterProfile = {
  username?: string;
  profile_image_url?: string;
  followers_count?: number;
  following_count?: number;
};

type RawTwitterPost = {
  id: string;
  text?: string;
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

async function refreshTwitterTokenIfNeeded(
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

async function fetchTwitterProfile(
  accessToken: string
): Promise<RawTwitterProfile> {
  return {
    username: "placeholder",
    profile_image_url: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchTwitterPosts(
  accessToken: string
): Promise<RawTwitterPost[]> {
  return [
    {
      id: "1",
      text: "Placeholder tweet",
      media_url: "",
      like_count: 0,
      reply_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTwitterProfile(
  raw: RawTwitterProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.profile_image_url ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeTwitterPost(
  raw: RawTwitterPost
): NormalizedPost {
  return {
    platform: "twitter",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.reply_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}