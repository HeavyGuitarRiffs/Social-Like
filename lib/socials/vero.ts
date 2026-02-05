// lib/socials/vero.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncVero(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    access_token,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    access_token: string;
  };

  if (!access_token) {
    return {
      platform: "vero",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  const profile = await fetchVeroProfile(access_token);
  const posts = await fetchVeroPosts(access_token);

  const normalizedProfile = normalizeVeroProfile(profile);
  const normalizedPosts = posts.map(normalizeVeroPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "vero",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
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
    platform: "vero",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawVeroProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawVeroPost = {
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

async function fetchVeroProfile(
  accessToken: string
): Promise<RawVeroProfile> {
  return {
    username: "Placeholder Vero User",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchVeroPosts(
  accessToken: string
): Promise<RawVeroPost[]> {
  return [
    {
      id: "1",
      text: "Placeholder Vero Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeVeroProfile(
  raw: RawVeroProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeVeroPost(
  raw: RawVeroPost
): NormalizedPost {
  return {
    platform: "vero",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}