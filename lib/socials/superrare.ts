// lib/socials/superrare.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncSuperRare(
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
      platform: "superrare",
      updated: false,
      error: "Missing wallet address",
      account_id,
    };
  }

  const profile = await fetchSuperRareProfile(wallet_address);
  const posts = await fetchSuperRareCreations(wallet_address);

  const normalizedProfile = normalizeSuperRareProfile(profile);
  const normalizedPosts = posts.map(normalizeSuperRareCreation);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "superrare",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // SuperRare does not expose following count
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
    platform: "superrare",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawSuperRareProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawSuperRareCreation = {
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

async function fetchSuperRareProfile(
  wallet: string
): Promise<RawSuperRareProfile> {
  return {
    username: "Placeholder SuperRare Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchSuperRareCreations(
  wallet: string
): Promise<RawSuperRareCreation[]> {
  return [
    {
      id: "1",
      name: "Placeholder SuperRare Artwork",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSuperRareProfile(
  raw: RawSuperRareProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeSuperRareCreation(
  raw: RawSuperRareCreation
): NormalizedPost {
  return {
    platform: "superrare",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}