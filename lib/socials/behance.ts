// lib/socials/behance.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncBehance(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "behance",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshBehanceTokenIfNeeded(
    account as unknown as BehanceAccount,                     // <-- Behance-specific fields
    supabase
  );

  const profile = await fetchBehanceProfile(refreshed.access_token);
  const posts = await fetchBehanceProjects(refreshed.access_token);

  const normalizedProfile = normalizeBehanceProfile(profile);
  const normalizedPosts = posts.map(normalizeBehanceProject);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "behance",
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
    platform: "behance",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type BehanceAccount = {
  access_token: string;
  user_id: string;
};

type RawBehanceProfile = {
  display_name?: string;
  images?: Record<number, string>;
  stats?: { followers?: number };
};

type RawBehanceProject = {
  id: string;
  name?: string;
  covers?: { original?: string };
  stats?: { appreciations?: number; comments?: number };
  published_on?: number;
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
   Helpers
------------------------------*/

async function refreshBehanceTokenIfNeeded(
  account: BehanceAccount,
  supabase: SupabaseClient<Database>
): Promise<BehanceAccount> {
  return account; // placeholder logic
}

async function fetchBehanceProfile(
  accessToken: string
): Promise<RawBehanceProfile> {
  return {
    display_name: "Placeholder Artist",
    images: { 138: "" },
    stats: { followers: 0 },
  };
}

async function fetchBehanceProjects(
  accessToken: string
): Promise<RawBehanceProject[]> {
  return [
    {
      id: "1",
      name: "Placeholder Project",
      covers: { original: "" },
      stats: { appreciations: 0, comments: 0 },
      published_on: Date.now(),
    },
  ];
}

function normalizeBehanceProfile(
  raw: RawBehanceProfile
): NormalizedProfile {
  return {
    username: raw.display_name ?? "",
    avatar_url: raw.images?.[138] ?? "",
    followers: raw.stats?.followers ?? 0,
  };
}

function normalizeBehanceProject(
  raw: RawBehanceProject
): NormalizedPost {
  return {
    platform: "behance",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.covers?.original ?? "",
    likes: raw.stats?.appreciations ?? 0,
    comments: raw.stats?.comments ?? 0,
    posted_at: new Date(raw.published_on ?? Date.now()).toISOString(),
  };
}