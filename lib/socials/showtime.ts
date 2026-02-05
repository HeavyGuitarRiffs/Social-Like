// lib/socials/showtime.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncShowtime(
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
      platform: "showtime",
      updated: false,
      error: "Missing wallet address",
      account_id,
    };
  }

  const profile = await fetchShowtimeProfile(wallet_address);
  const posts = await fetchShowtimeNFTs(wallet_address);

  const normalizedProfile = normalizeShowtimeProfile(profile);
  const normalizedPosts = posts.map(normalizeShowtimeNFT);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "showtime",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Showtime does not expose following count
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
    platform: "showtime",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawShowtimeProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawShowtimeNFT = {
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

async function fetchShowtimeProfile(
  wallet: string
): Promise<RawShowtimeProfile> {
  return {
    username: "Placeholder Showtime Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchShowtimeNFTs(
  wallet: string
): Promise<RawShowtimeNFT[]> {
  return [
    {
      id: "1",
      name: "Placeholder Showtime NFT",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeShowtimeProfile(
  raw: RawShowtimeProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeShowtimeNFT(
  raw: RawShowtimeNFT
): NormalizedPost {
  return {
    platform: "showtime",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}