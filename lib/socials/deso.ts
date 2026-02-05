// lib/socials/deso.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncDeSo(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { public_key, user_id } = account as unknown as {      // <-- public-key–based auth
    public_key: string;
    user_id: string;
  };

  if (!public_key) {
    return {
      platform: "deso",
      updated: false,
      error: "Missing public key",
    };
  }

  const profile = await fetchDeSoProfile(public_key);
  const posts = await fetchDeSoPosts(public_key);

  const normalizedProfile = normalizeDeSoProfile(profile);
  const normalizedPosts = posts.map(normalizeDeSoPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "deso",
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
    platform: "deso",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawDeSoProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawDeSoPost = {
  id: string;
  body?: string;
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
   Helpers
------------------------------*/

async function fetchDeSoProfile(
  pubkey: string
): Promise<RawDeSoProfile> {
  return {
    username: "Placeholder DeSo User",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchDeSoPosts(
  pubkey: string
): Promise<RawDeSoPost[]> {
  return [
    {
      id: "1",
      body: "Placeholder DeSo Post",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeDeSoProfile(
  raw: RawDeSoProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeDeSoPost(
  raw: RawDeSoPost
): NormalizedPost {
  return {
    platform: "deso",
    post_id: raw.id,
    caption: raw.body ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}