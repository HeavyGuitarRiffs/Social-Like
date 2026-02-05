// lib/socials/lens.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncLens(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { wallet_address, user_id } = account as unknown as {
    wallet_address: string;
    user_id: string;
  };

  if (!wallet_address) {
    return {
      platform: "lens",
      updated: false,
      error: "Missing wallet address",
    };
  }

  const profile = await fetchLensProfile(wallet_address);
  const posts = await fetchLensPublications(wallet_address);

  const normalizedProfile = normalizeLensProfile(profile);
  const normalizedPosts = posts.map(normalizeLensPublication);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "lens",
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
    platform: "lens",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawLensProfile = {
  handle?: string;
  avatar?: string;
  followers?: number;
  following?: number;
};

type RawLensPublication = {
  id: string;
  content?: string;
  media_url?: string;
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

async function fetchLensProfile(
  wallet: string
): Promise<RawLensProfile> {
  return {
    handle: "placeholder.lens",
    avatar: "",
    followers: 0,
    following: 0,
  };
}

async function fetchLensPublications(
  wallet: string
): Promise<RawLensPublication[]> {
  return [
    {
      id: "1",
      content: "Placeholder Lens Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeLensProfile(
  raw: RawLensProfile
): NormalizedProfile {
  return {
    username: raw.handle ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeLensPublication(
  raw: RawLensPublication
): NormalizedPost {
  return {
    platform: "lens",
    post_id: raw.id,
    caption: raw.content ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}