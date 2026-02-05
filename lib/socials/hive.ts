// lib/socials/hive.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncHive(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { username, user_id } = account as unknown as {
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "hive",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchHiveProfile(username);
  const posts = await fetchHivePosts(username);

  const normalizedProfile = normalizeHiveProfile(profile);
  const normalizedPosts = posts.map(normalizeHivePost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "hive",
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
    platform: "hive",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawHiveProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawHivePost = {
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
   Placeholder Fetchers
------------------------------*/

async function fetchHiveProfile(
  username: string
): Promise<RawHiveProfile> {
  return {
    username: "Placeholder Hive User",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchHivePosts(
  username: string
): Promise<RawHivePost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Hive Post",
      body: "Placeholder content",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeHiveProfile(
  raw: RawHiveProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeHivePost(
  raw: RawHivePost
): NormalizedPost {
  return {
    platform: "hive",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}