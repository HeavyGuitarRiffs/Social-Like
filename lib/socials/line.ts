// lib/socials/line.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncLINE(
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
      platform: "line",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Standardized token refresh pattern
  const refreshed = await refreshLINETokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchLINEProfile(refreshed.access_token);
  const posts = await fetchLINETimeline(refreshed.access_token);

  const normalizedProfile = normalizeLINEProfile(profile);
  const normalizedPosts = posts.map(normalizeLINEPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "line",
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
    platform: "line",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawLINEProfile = {
  displayName?: string;
  pictureUrl?: string;
  followers?: number;
  following?: number;
};

type RawLINEPost = {
  id: string;
  text?: string;
  media_url?: string;
  like_count?: number;
  comment_count?: number;
  createdTime?: string;
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

async function refreshLINETokenIfNeeded(
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

async function fetchLINEProfile(
  accessToken: string
): Promise<RawLINEProfile> {
  return {
    displayName: "Placeholder LINE User",
    pictureUrl: "",
    followers: 0,
    following: 0,
  };
}

async function fetchLINETimeline(
  accessToken: string
): Promise<RawLINEPost[]> {
  return [
    {
      id: "1",
      text: "Placeholder LINE Post",
      media_url: "",
      like_count: 0,
      comment_count: 0,
      createdTime: new Date().toISOString(),
    },
  ];
}

function normalizeLINEProfile(raw: RawLINEProfile): NormalizedProfile {
  return {
    username: raw.displayName ?? "",
    avatar_url: raw.pictureUrl ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeLINEPost(raw: RawLINEPost): NormalizedPost {
  return {
    platform: "line",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.createdTime ?? new Date().toISOString(),
  };
}