// lib/socials/fivehundredpx.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncFiveHundredPx(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { access_token, user_id } = account as unknown as {
    access_token: string;
    user_id: string;
  };

  if (!access_token) {
    return {
      platform: "500px",
      updated: false,
      error: "Missing access token",
    };
  }

  const profile = await fetchFiveHundredPxProfile(access_token);
  const posts = await fetchFiveHundredPxPhotos(access_token);

  const normalizedProfile = normalizeFiveHundredPxProfile(profile);
  const normalizedPosts = posts.map(normalizeFiveHundredPxPhoto);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "500px",
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
    platform: "500px",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawFiveHundredPxProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawFiveHundredPxPhoto = {
  id: string;
  name?: string;
  image_url?: string;
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

async function fetchFiveHundredPxProfile(
  accessToken: string
): Promise<RawFiveHundredPxProfile> {
  return {
    username: "Placeholder 500px Photographer",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchFiveHundredPxPhotos(
  accessToken: string
): Promise<RawFiveHundredPxPhoto[]> {
  return [
    {
      id: "1",
      name: "Placeholder 500px Photo",
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

function normalizeFiveHundredPxProfile(
  raw: RawFiveHundredPxProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeFiveHundredPxPhoto(
  raw: RawFiveHundredPxPhoto
): NormalizedPost {
  return {
    platform: "500px",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}