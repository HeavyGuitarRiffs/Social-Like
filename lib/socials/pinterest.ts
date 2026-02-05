// lib/socials/pinterest.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncPinterest(
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
      platform: "pinterest",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Pinterest refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshPinterestTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchPinterestProfile(refreshed.access_token);
  const posts = await fetchPinterestPins(refreshed.access_token);

  const normalizedProfile = normalizePinterestProfile(profile);
  const normalizedPosts = posts.map(normalizePinterestPin);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "pinterest",
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
    platform: "pinterest",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawPinterestProfile = {
  username?: string;
  profile_image?: string;
  follower_count?: number;
  following_count?: number;
};

type RawPinterestPin = {
  id: string;
  title?: string;
  image_url?: string;
  save_count?: number;
  comment_count?: number;
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

async function refreshPinterestTokenIfNeeded(
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

async function fetchPinterestProfile(
  accessToken: string
): Promise<RawPinterestProfile> {
  return {
    username: "placeholder",
    profile_image: "",
    follower_count: 0,
    following_count: 0,
  };
}

async function fetchPinterestPins(
  accessToken: string
): Promise<RawPinterestPin[]> {
  return [
    {
      id: "1",
      title: "Placeholder Pin",
      image_url: "",
      save_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizePinterestProfile(
  raw: RawPinterestProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.profile_image ?? "",
    followers: raw.follower_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizePinterestPin(
  raw: RawPinterestPin
): NormalizedPost {
  return {
    platform: "pinterest",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.save_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}