// lib/socials/foundation.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncFoundation(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { wallet_address, user_id } = account as unknown as {
    wallet_address: string;
    user_id: string;
  };

  if (!wallet_address) {
    return {
      platform: "foundation",
      updated: false,
      error: "Missing wallet address",
    };
  }

  const profile = await fetchFoundationProfile(wallet_address);
  const posts = await fetchFoundationCreations(wallet_address);

  const normalizedProfile = normalizeFoundationProfile(profile);
  const normalizedPosts = posts.map(normalizeFoundationCreation);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "foundation",
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
    platform: "foundation",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawFoundationProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawFoundationCreation = {
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

async function fetchFoundationProfile(
  wallet: string
): Promise<RawFoundationProfile> {
  return {
    username: "Placeholder Foundation Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchFoundationCreations(
  wallet: string
): Promise<RawFoundationCreation[]> {
  return [
    {
      id: "1",
      name: "Placeholder Foundation Artwork",
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

function normalizeFoundationProfile(
  raw: RawFoundationProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeFoundationCreation(
  raw: RawFoundationCreation
): NormalizedPost {
  return {
    platform: "foundation",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}