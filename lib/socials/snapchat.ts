// lib/socials/snapchat.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncSnapchat(
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
      platform: "snapchat",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Snapchat refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshSnapchatTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchSnapchatProfile(refreshed.access_token);
  const posts = await fetchSnapchatStories(refreshed.access_token);

  const normalizedProfile = normalizeSnapchatProfile(profile);
  const normalizedPosts = posts.map(normalizeSnapchatStory);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "snapchat",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Snapchat does not expose following count
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
    platform: "snapchat",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawSnapchatProfile = {
  username?: string;
  avatar?: string;
  subscriber_count?: number;
};

type RawSnapchatStory = {
  id: string;
  text?: string;
  media_url?: string;
  view_count?: number;
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

async function refreshSnapchatTokenIfNeeded(
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

async function fetchSnapchatProfile(
  accessToken: string
): Promise<RawSnapchatProfile> {
  return {
    username: "Placeholder Snap User",
    avatar: "",
    subscriber_count: 0,
  };
}

async function fetchSnapchatStories(
  accessToken: string
): Promise<RawSnapchatStory[]> {
  return [
    {
      id: "1",
      text: "Placeholder Story",
      media_url: "",
      view_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSnapchatProfile(
  raw: RawSnapchatProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.subscriber_count ?? 0,
  };
}

function normalizeSnapchatStory(
  raw: RawSnapchatStory
): NormalizedPost {
  return {
    platform: "snapchat",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.view_count ?? 0, // views = likes in your schema
    comments: 0, // Snapchat stories do not expose comments
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}