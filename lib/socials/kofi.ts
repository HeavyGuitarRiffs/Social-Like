// lib/socials/kofi.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncKofi(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { username, user_id } = account as unknown as {
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "kofi",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchKofiProfile(username);
  const posts = await fetchKofiPosts(username);

  const normalizedProfile = normalizeKofiProfile(profile);
  const normalizedPosts = posts.map(normalizeKofiPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "kofi",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.supporters,
    following: 0,
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
    platform: "kofi",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawKofiProfile = {
  username?: string;
  avatar_url?: string;
  supporters?: number;
};

type RawKofiPost = {
  id: string;
  title?: string;
  image_url?: string;
  likes?: number;
  comments?: number;
  created_at?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
  supporters: number;
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

async function fetchKofiProfile(
  username: string
): Promise<RawKofiProfile> {
  return {
    username: "Placeholder Ko-fi Creator",
    avatar_url: "",
    supporters: 0,
  };
}

async function fetchKofiPosts(
  username: string
): Promise<RawKofiPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Ko-fi Post",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeKofiProfile(
  raw: RawKofiProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    supporters: raw.supporters ?? 0,
  };
}

function normalizeKofiPost(
  raw: RawKofiPost
): NormalizedPost {
  return {
    platform: "kofi",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}