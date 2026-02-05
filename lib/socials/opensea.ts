// lib/socials/opensea.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncOpenSea(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    wallet_address,
    access_token,
    refresh_token,
    expires_at,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    wallet_address: string;
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  };

  if (!wallet_address) {
    return {
      platform: "opensea",
      updated: false,
      error: "Missing wallet address",
      account_id,
    };
  }

  // OpenSea rarely uses tokens, but we keep the signature consistent
  const refreshed = await refreshOpenSeaTokenIfNeeded(
    { account_id, user_id, wallet_address, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchOpenSeaProfile(wallet_address);
  const posts = await fetchOpenSeaAssets(wallet_address);

  const normalizedProfile = normalizeOpenSeaProfile(profile);
  const normalizedPosts = posts.map(normalizeOpenSeaAsset);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "opensea",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // OpenSea does not expose following count
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
    platform: "opensea",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawOpenSeaProfile = {
  username?: string;
  image_url?: string;
  followers?: number;
};

type RawOpenSeaAsset = {
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

async function refreshOpenSeaTokenIfNeeded(
  account: {
    account_id: string;
    user_id: string;
    wallet_address: string;
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  },
  supabase: SupabaseClient<Database>
) {
  return account; // placeholder logic
}

async function fetchOpenSeaProfile(
  wallet: string
): Promise<RawOpenSeaProfile> {
  return {
    username: "Placeholder OpenSea User",
    image_url: "",
    followers: 0,
  };
}

async function fetchOpenSeaAssets(
  wallet: string
): Promise<RawOpenSeaAsset[]> {
  return [
    {
      id: "1",
      name: "Placeholder NFT",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeOpenSeaProfile(
  raw: RawOpenSeaProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.image_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeOpenSeaAsset(
  raw: RawOpenSeaAsset
): NormalizedPost {
  return {
    platform: "opensea",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}