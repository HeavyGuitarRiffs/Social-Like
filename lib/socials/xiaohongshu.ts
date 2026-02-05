// lib/socials/xiaohongshu.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncXiaohongshu(
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
      platform: "xiaohongshu",
      updated: false,
      error: "Missing username",
      account_id,
    };
  }

  const profile = await fetchRedProfile(username);
  const posts = await fetchRedPosts(username);

  const normalizedProfile = normalizeRedProfile(profile);
  const normalizedPosts = posts.map(normalizeRedPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "xiaohongshu",
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
    platform: "xiaohongshu",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawRedProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawRedPost = {
  id: string;
  caption?: string;
  media_url?: string;
  likes?: number;
  comments?: number;
  posted_at?: string;
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
   Placeholder Fetchers
------------------------------*/

async function fetchRedProfile(username: string): Promise<RawRedProfile> {
  return {
    username,
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchRedPosts(username: string): Promise<RawRedPost[]> {
  return [
    {
      id: "1",
      caption: "Placeholder Xiaohongshu post",
      media_url: "",
      likes: 0,
      comments: 0,
      posted_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeRedProfile(raw: RawRedProfile): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeRedPost(raw: RawRedPost): NormalizedPost {
  return {
    platform: "xiaohongshu",
    post_id: raw.id,
    caption: raw.caption ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}