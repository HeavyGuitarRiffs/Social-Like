// lib/socials/steemit.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncSteemit(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    username,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    username: string;
  };

  if (!username) {
    return {
      platform: "steemit",
      updated: false,
      error: "Missing username",
      account_id,
    };
  }

  const profile = await fetchSteemitProfile(username);
  const posts = await fetchSteemitPosts(username);

  const normalizedProfile = normalizeSteemitProfile(profile);
  const normalizedPosts = posts.map(normalizeSteemitPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "steemit",
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
    platform: "steemit",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawSteemitProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawSteemitPost = {
  id: string;
  title?: string;
  body?: string;
  likes?: number;
  comments?: number;
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

async function fetchSteemitProfile(
  username: string
): Promise<RawSteemitProfile> {
  return {
    username: "Placeholder Steemit User",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchSteemitPosts(
  username: string
): Promise<RawSteemitPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Steemit Post",
      body: "Placeholder content",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSteemitProfile(
  raw: RawSteemitProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeSteemitPost(
  raw: RawSteemitPost
): NormalizedPost {
  return {
    platform: "steemit",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}