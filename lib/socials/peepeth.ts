// lib/socials/peepeth.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncPeepeth(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    eth_address,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    eth_address: string;
  };

  if (!eth_address) {
    return {
      platform: "peepeth",
      updated: false,
      error: "Missing Ethereum address",
      account_id,
    };
  }

  const profile = await fetchPeepethProfile(eth_address);
  const posts = await fetchPeepethPosts(eth_address);

  const normalizedProfile = normalizePeepethProfile(profile);
  const normalizedPosts = posts.map(normalizePeepethPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "peepeth",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Peepeth does not expose following count
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
    platform: "peepeth",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawPeepethProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawPeepethPost = {
  id: string;
  text?: string;
  media_url?: string;
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

async function fetchPeepethProfile(
  address: string
): Promise<RawPeepethProfile> {
  return {
    username: "Placeholder Peepeth User",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchPeepethPosts(
  address: string
): Promise<RawPeepethPost[]> {
  return [
    {
      id: "1",
      text: "Placeholder Peepeth Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizePeepethProfile(
  raw: RawPeepethProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizePeepethPost(
  raw: RawPeepethPost
): NormalizedPost {
  return {
    platform: "peepeth",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}