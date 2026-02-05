// lib/socials/okru.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncOKRu(
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
      platform: "okru",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // OK.ru token refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshOKRuTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchOKRuProfile(refreshed.access_token);
  const posts = await fetchOKRuPosts(refreshed.access_token);

  const normalizedProfile = normalizeOKRuProfile(profile);
  const normalizedPosts = posts.map(normalizeOKRuPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "okru",
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
    platform: "okru",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawOKRuProfile = {
  name?: string;
  pic_full?: string;
  followers_count?: number;
  friends_count?: number;
};

type RawOKRuPost = {
  id: string;
  text?: string;
  media_url?: string;
  like_count?: number;
  comment_count?: number;
  created_ms?: number;
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

async function refreshOKRuTokenIfNeeded(
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

async function fetchOKRuProfile(
  accessToken: string
): Promise<RawOKRuProfile> {
  return {
    name: "Placeholder OK User",
    pic_full: "",
    followers_count: 0,
    friends_count: 0,
  };
}

async function fetchOKRuPosts(
  accessToken: string
): Promise<RawOKRuPost[]> {
  return [
    {
      id: "1",
      text: "Placeholder OK.ru Post",
      media_url: "",
      like_count: 0,
      comment_count: 0,
      created_ms: Date.now(),
    },
  ];
}

function normalizeOKRuProfile(
  raw: RawOKRuProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.pic_full ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.friends_count ?? 0,
  };
}

function normalizeOKRuPost(
  raw: RawOKRuPost
): NormalizedPost {
  return {
    platform: "okru",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.created_ms
      ? new Date(raw.created_ms).toISOString()
      : new Date().toISOString(),
  };
}