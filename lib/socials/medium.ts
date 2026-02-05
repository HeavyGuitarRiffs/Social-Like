// lib/socials/medium.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncMedium(
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
      platform: "medium",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Standardized token refresh pattern
  const refreshed = await refreshMediumTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchMediumProfile(refreshed.access_token);
  const posts = await fetchMediumPosts(refreshed.access_token);

  const normalizedProfile = normalizeMediumProfile(profile);
  const normalizedPosts = posts.map(normalizeMediumPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "medium",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Medium does not expose following count
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
    platform: "medium",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawMediumProfile = {
  name?: string;
  image_url?: string;
  followers?: number;
};

type RawMediumPost = {
  id: string;
  title?: string;
  image_url?: string;
  clap_count?: number;
  comment_count?: number;
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

async function refreshMediumTokenIfNeeded(
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

async function fetchMediumProfile(
  accessToken: string
): Promise<RawMediumProfile> {
  return {
    name: "Placeholder Author",
    image_url: "",
    followers: 0,
  };
}

async function fetchMediumPosts(
  accessToken: string
): Promise<RawMediumPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Medium Article",
      image_url: "",
      clap_count: 0,
      comment_count: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizeMediumProfile(
  raw: RawMediumProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.image_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeMediumPost(raw: RawMediumPost): NormalizedPost {
  return {
    platform: "medium",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.clap_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}