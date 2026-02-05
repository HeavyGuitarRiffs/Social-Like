// lib/socials/dtube.ts

import type { Account } from "./socialIndex";                 
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncDTube(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { username, user_id } = account as unknown as {
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "dtube",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchDTubeProfile(username);
  const posts = await fetchDTubeVideos(username);

  const normalizedProfile = normalizeDTubeProfile(profile);
  const normalizedPosts = posts.map(normalizeDTubeVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "dtube",
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
    platform: "dtube",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawDTubeProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawDTubePost = {
  id: string;
  title?: string;
  thumbnail_url?: string;
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

async function fetchDTubeProfile(
  username: string
): Promise<RawDTubeProfile> {
  return {
    username,
    avatar_url: "",
    followers: Math.floor(Math.random() * 5000),
    following: Math.floor(Math.random() * 200),
  };
}

async function fetchDTubeVideos(
  username: string
): Promise<RawDTubePost[]> {
  return [
    {
      id: `${username}-1`,
      title: "Placeholder DTube Video",
      thumbnail_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeDTubeProfile(
  raw: RawDTubeProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeDTubeVideo(
  raw: RawDTubePost
): NormalizedPost {
  return {
    platform: "dtube",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}