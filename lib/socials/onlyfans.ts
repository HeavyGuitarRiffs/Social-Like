// lib/socials/onlyfans.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncOnlyFans(
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
      platform: "onlyfans",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // OnlyFans refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshOnlyFansTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchOnlyFansProfile(refreshed.access_token);
  const posts = await fetchOnlyFansPosts(refreshed.access_token);

  const normalizedProfile = normalizeOnlyFansProfile(profile);
  const normalizedPosts = posts.map(normalizeOnlyFansPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "onlyfans",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.subscribers,
    following: 0, // OnlyFans does not expose following count
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
    platform: "onlyfans",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawOnlyFansProfile = {
  username?: string;
  avatar?: string;
  subscriber_count?: number;
};

type RawOnlyFansPost = {
  id: string;
  text?: string;
  media_url?: string;
  like_count?: number;
  comment_count?: number;
  posted_at?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
  subscribers: number;
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

async function refreshOnlyFansTokenIfNeeded(
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

async function fetchOnlyFansProfile(
  accessToken: string
): Promise<RawOnlyFansProfile> {
  return {
    username: "Placeholder Creator",
    avatar: "",
    subscriber_count: 0,
  };
}

async function fetchOnlyFansPosts(
  accessToken: string
): Promise<RawOnlyFansPost[]> {
  return [
    {
      id: "1",
      text: "Placeholder OnlyFans Post",
      media_url: "",
      like_count: 0,
      comment_count: 0,
      posted_at: new Date().toISOString(),
    },
  ];
}

function normalizeOnlyFansProfile(
  raw: RawOnlyFansProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    subscribers: raw.subscriber_count ?? 0,
  };
}

function normalizeOnlyFansPost(
  raw: RawOnlyFansPost
): NormalizedPost {
  return {
    platform: "onlyfans",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}