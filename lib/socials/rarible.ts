// lib/socials/rarible.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncRarible(
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
      platform: "rarible",
      updated: false,
      error: "Missing wallet address",
      account_id,
    };
  }

  const profile = await fetchRaribleProfile(wallet_address);
  const posts = await fetchRaribleItems(wallet_address);

  const normalizedProfile = normalizeRaribleProfile(profile);
  const normalizedPosts = posts.map(normalizeRaribleItem);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "rarible",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Rarible does not expose following count
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
    platform: "rarible",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawRaribleProfile = {
  username?: string;
  avatar?: string;
  followers?: number;
};

type RawRaribleItem = {
  id: string;
  name?: string;
  image?: string;
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

async function fetchRaribleProfile(
  wallet: string
): Promise<RawRaribleProfile> {
  return {
    username: "Placeholder Rarible User",
    avatar: "",
    followers: 0,
  };
}

async function fetchRaribleItems(
  wallet: string
): Promise<RawRaribleItem[]> {
  return [
    {
      id: "1",
      name: "Placeholder Rarible NFT",
      image: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeRaribleProfile(
  raw: RawRaribleProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeRaribleItem(
  raw: RawRaribleItem
): NormalizedPost {
  return {
    platform: "rarible",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}