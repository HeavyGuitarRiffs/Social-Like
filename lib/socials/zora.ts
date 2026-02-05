// lib/socials/zora.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncZora(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    wallet_address,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    wallet_address: string;
  };

  if (!wallet_address) {
    return {
      platform: "zora",
      updated: false,
      error: "Missing wallet address",
      account_id,
    };
  }

  const profile = await fetchZoraProfile(wallet_address);
  const posts = await fetchZoraMints(wallet_address);

  const normalizedProfile = normalizeZoraProfile(profile);
  const normalizedPosts = posts.map(normalizeZoraMint);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "zora",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Zora does not expose following count
    last_synced: new Date().toISOString(),
  });

  /* ---------------------------------
     social_posts
  ----------------------------------*/
  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(
      normalizedPosts.map((p) => ({
        ...p,
        user_id,
        account_id,
      }))
    );
  }

  return {
    platform: "zora",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawZoraProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawZoraMint = {
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
   Helpers
------------------------------*/

async function fetchZoraProfile(wallet: string): Promise<RawZoraProfile> {
  return {
    username: "Placeholder Zora Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchZoraMints(wallet: string): Promise<RawZoraMint[]> {
  return [
    {
      id: "1",
      name: "Placeholder Zora Mint",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeZoraProfile(raw: RawZoraProfile): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeZoraMint(raw: RawZoraMint): NormalizedPost {
  return {
    platform: "zora",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}