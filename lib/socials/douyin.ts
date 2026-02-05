// lib/socials/douyin.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncDouyin(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
): Promise<SyncResult> {
  const { username, user_id } = account as unknown as {        // <-- username-based auth
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "douyin",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchDouyinProfile(username);
  const posts = await fetchDouyinPosts(username);

  const normalizedProfile = normalizeDouyinProfile(profile);
  const normalizedPosts = posts.map(normalizeDouyinPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "douyin",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(
      normalizedPosts.map((p) => ({
        ...p,
        user_id,
      }))
    );
  }

  return {
    platform: "douyin",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawDouyinProfile = {
  nickname?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawDouyinPost = {
  id: string;
  desc?: string;
  cover_url?: string;
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

type SyncResult = {
  platform: string;
  updated: boolean;
  posts?: number;
  metrics?: boolean;
  error?: string;
};

/* -----------------------------
   Placeholder Fetchers
------------------------------*/

async function fetchDouyinProfile(
  username: string
): Promise<RawDouyinProfile> {
  return {
    nickname: username,
    avatar_url: "",
    followers: Math.floor(Math.random() * 10000),
    following: Math.floor(Math.random() * 500),
  };
}

async function fetchDouyinPosts(
  username: string
): Promise<RawDouyinPost[]> {
  return Array.from({ length: 3 }).map((_, i) => ({
    id: `${username}-${i}`,
    desc: `Douyin video ${i + 1}`,
    cover_url: "",
    likes: Math.floor(Math.random() * 500),
    comments: Math.floor(Math.random() * 50),
    created_at: new Date().toISOString(),
  }));
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeDouyinProfile(
  raw: RawDouyinProfile
): NormalizedProfile {
  return {
    username: raw.nickname ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeDouyinPost(
  raw: RawDouyinPost
): NormalizedPost {
  return {
    platform: "douyin",
    post_id: raw.id,
    caption: raw.desc ?? "",
    media_url: raw.cover_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}