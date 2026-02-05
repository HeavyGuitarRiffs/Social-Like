// lib/socials/reddit.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncReddit(
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
      platform: "reddit",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Reddit refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshRedditTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchRedditProfile(refreshed.access_token);
  const posts = await fetchRedditPosts(refreshed.access_token);

  const normalizedProfile = normalizeRedditProfile(profile);
  const normalizedPosts = posts.map(normalizeRedditPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "reddit",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Reddit does not expose following count
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
    platform: "reddit",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawRedditProfile = {
  name?: string;
  icon_img?: string;
  total_karma?: number;
  followers?: number;
};

type RawRedditPost = {
  id: string;
  title?: string;
  media_url?: string;
  ups?: number;
  num_comments?: number;
  created_utc?: number;
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

async function refreshRedditTokenIfNeeded(
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

async function fetchRedditProfile(
  accessToken: string
): Promise<RawRedditProfile> {
  return {
    name: "placeholder",
    icon_img: "",
    total_karma: 0,
    followers: 0,
  };
}

async function fetchRedditPosts(
  accessToken: string
): Promise<RawRedditPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Reddit Post",
      media_url: "",
      ups: 0,
      num_comments: 0,
      created_utc: Date.now(),
    },
  ];
}

function normalizeRedditProfile(
  raw: RawRedditProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.icon_img ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeRedditPost(
  raw: RawRedditPost
): NormalizedPost {
  return {
    platform: "reddit",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.ups ?? 0,
    comments: raw.num_comments ?? 0,
    posted_at: raw.created_utc
      ? new Date(raw.created_utc).toISOString()
      : new Date().toISOString(),
  };
}