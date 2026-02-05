// lib/socials/ghost.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncGhost(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { api_key, site_url, user_id } = account as unknown as {
    api_key: string;
    site_url: string;
    user_id: string;
  };

  if (!api_key || !site_url) {
    return {
      platform: "ghost",
      updated: false,
      error: "Missing API key or site URL",
    };
  }

  const profile = await fetchGhostProfile(api_key, site_url);
  const posts = await fetchGhostPosts(api_key, site_url);

  const normalizedProfile = normalizeGhostProfile(profile);
  const normalizedPosts = posts.map(normalizeGhostPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "ghost",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: 0,
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
    platform: "ghost",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawGhostProfile = {
  username?: string;
  avatar_url?: string;
};

type RawGhostPost = {
  id: string;
  title?: string;
  feature_image?: string;
  likes?: number;
  comments?: number;
  published_at?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
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

async function fetchGhostProfile(
  apiKey: string,
  site: string
): Promise<RawGhostProfile> {
  return {
    username: "Placeholder Ghost Author",
    avatar_url: "",
  };
}

async function fetchGhostPosts(
  apiKey: string,
  site: string
): Promise<RawGhostPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Ghost Post",
      feature_image: "",
      likes: 0,
      comments: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeGhostProfile(
  raw: RawGhostProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
  };
}

function normalizeGhostPost(
  raw: RawGhostPost
): NormalizedPost {
  return {
    platform: "ghost",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.feature_image ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}