// lib/socials/substack.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncSubstack(
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
      platform: "substack",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Substack refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshSubstackTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchSubstackProfile(refreshed.access_token);
  const posts = await fetchSubstackPosts(refreshed.access_token);

  const normalizedProfile = normalizeSubstackProfile(profile);
  const normalizedPosts = posts.map(normalizeSubstackPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "substack",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.subscribers,
    following: 0, // Substack does not expose following count
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
    platform: "substack",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawSubstackProfile = {
  name?: string;
  profile_image?: string;
  subscriber_count?: number;
};

type RawSubstackPost = {
  id: string;
  title?: string;
  body?: string;
  like_count?: number;
  comment_count?: number;
  published_at?: string;
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

async function refreshSubstackTokenIfNeeded(
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

async function fetchSubstackProfile(
  accessToken: string
): Promise<RawSubstackProfile> {
  return {
    name: "Placeholder Writer",
    profile_image: "",
    subscriber_count: 0,
  };
}

async function fetchSubstackPosts(
  accessToken: string
): Promise<RawSubstackPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Substack Post",
      body: "",
      like_count: 0,
      comment_count: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizeSubstackProfile(
  raw: RawSubstackProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.profile_image ?? "",
    subscribers: raw.subscriber_count ?? 0,
  };
}

function normalizeSubstackPost(
  raw: RawSubstackPost
): NormalizedPost {
  return {
    platform: "substack",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}