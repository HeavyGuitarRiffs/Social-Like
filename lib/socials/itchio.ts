// lib/socials/itchio.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncItchio(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { username, user_id } = account as unknown as {
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "itchio",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchItchioProfile(username);
  const posts = await fetchItchioProjects(username);

  const normalizedProfile = normalizeItchioProfile(profile);
  const normalizedPosts = posts.map(normalizeItchioProject);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "itchio",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
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
    platform: "itchio",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawItchioProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawItchioProject = {
  id: string;
  title?: string;
  cover_url?: string;
  downloads?: number;
  comments?: number;
  created_at?: string;
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
   Placeholder Fetchers
------------------------------*/

async function fetchItchioProfile(
  username: string
): Promise<RawItchioProfile> {
  return {
    username: "Placeholder Itch.io Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchItchioProjects(
  username: string
): Promise<RawItchioProject[]> {
  return [
    {
      id: "1",
      title: "Placeholder Itch.io Game",
      cover_url: "",
      downloads: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeItchioProfile(
  raw: RawItchioProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeItchioProject(
  raw: RawItchioProject
): NormalizedPost {
  return {
    platform: "itchio",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.cover_url ?? "",
    likes: raw.downloads ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}