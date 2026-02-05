// lib/socials/kuaishou.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncKuaishou(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { username, user_id } = account as unknown as {
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "kuaishou",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchKuaishouProfile(username);
  const posts = await fetchKuaishouPosts(username);

  const normalizedProfile = normalizeKuaishouProfile(profile);
  const normalizedPosts = posts.map(normalizeKuaishouPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "kuaishou",
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
    platform: "kuaishou",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawKuaishouProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawKuaishouPost = {
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

async function fetchKuaishouProfile(
  username: string
): Promise<RawKuaishouProfile> {
  return {
    username,
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchKuaishouPosts(
  username: string
): Promise<RawKuaishouPost[]> {
  return [
    {
      id: "1",
      caption: "Placeholder Kuaishou post",
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

function normalizeKuaishouProfile(
  raw: RawKuaishouProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeKuaishouPost(
  raw: RawKuaishouPost
): NormalizedPost {
  return {
    platform: "kuaishou",
    post_id: raw.id,
    caption: raw.caption ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}