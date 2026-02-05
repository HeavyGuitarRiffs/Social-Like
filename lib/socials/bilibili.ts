// lib/socials/bilibili.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncBilibili(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "bilibili",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshBilibiliTokenIfNeeded(
    account as unknown as BilibiliAccount,                    // <-- Behance-style cast
    supabase
  );

  const profile = await fetchBilibiliProfile(refreshed.access_token);
  const posts = await fetchBilibiliVideos(refreshed.access_token);

  const normalizedProfile = normalizeBilibiliProfile(profile);
  const normalizedPosts = posts.map(normalizeBilibiliVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "bilibili",
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
    platform: "bilibili",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type BilibiliAccount = {
  access_token: string;
  user_id: string;
};

type RawBilibiliProfile = {
  name?: string;
  face?: string;
  follower?: number;
  following?: number;
};

type RawBilibiliPost = {
  id: string;
  title?: string;
  pic?: string;
  like?: number;
  reply?: number;
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

async function refreshBilibiliTokenIfNeeded(
  account: BilibiliAccount,
  supabase: SupabaseClient<Database>
): Promise<BilibiliAccount> {
  return account; // placeholder logic
}

async function fetchBilibiliProfile(
  accessToken: string
): Promise<RawBilibiliProfile> {
  return {
    name: "Placeholder Bilibili User",
    face: "",
    follower: 0,
    following: 0,
  };
}

async function fetchBilibiliVideos(
  accessToken: string
): Promise<RawBilibiliPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Bilibili Video",
      pic: "",
      like: 0,
      reply: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeBilibiliProfile(
  raw: RawBilibiliProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.face ?? "",
    followers: raw.follower ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeBilibiliVideo(
  raw: RawBilibiliPost
): NormalizedPost {
  return {
    platform: "bilibili",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.pic ?? "",
    likes: raw.like ?? 0,
    comments: raw.reply ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}