// lib/socials/dribbble.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncDribbble(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "dribbble",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshDribbbleTokenIfNeeded(
    account as unknown as DribbbleAccount,                    // <-- Dribbble-specific fields
    supabase
  );

  const profile = await fetchDribbbleProfile(refreshed.access_token);
  const posts = await fetchDribbbleShots(refreshed.access_token);

  const normalizedProfile = normalizeDribbbleProfile(profile);
  const normalizedPosts = posts.map(normalizeDribbbleShot);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "dribbble",
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
    platform: "dribbble",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type DribbbleAccount = {
  access_token: string;
  user_id: string;
};

type RawDribbbleProfile = {
  name?: string;
  avatar_url?: string;
  followers_count?: number;
  following_count?: number;
};

type RawDribbbleShot = {
  id: string;
  title?: string;
  images?: { normal?: string };
  likes_count?: number;
  comments_count?: number;
  published_at?: string;
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

async function refreshDribbbleTokenIfNeeded(
  account: DribbbleAccount,
  supabase: SupabaseClient<Database>
): Promise<DribbbleAccount> {
  return account; // placeholder logic
}

async function fetchDribbbleProfile(
  accessToken: string
): Promise<RawDribbbleProfile> {
  return {
    name: "Placeholder Designer",
    avatar_url: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchDribbbleShots(
  accessToken: string
): Promise<RawDribbbleShot[]> {
  return [
    {
      id: "1",
      title: "Placeholder Shot",
      images: { normal: "" },
      likes_count: 0,
      comments_count: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizeDribbbleProfile(
  raw: RawDribbbleProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeDribbbleShot(
  raw: RawDribbbleShot
): NormalizedPost {
  return {
    platform: "dribbble",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.images?.normal ?? "",
    likes: raw.likes_count ?? 0,
    comments: raw.comments_count ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}