// lib/socials/facebook.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncFacebook(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { access_token, user_id } = account as unknown as {
    access_token: string;
    user_id: string;
  };

  if (!access_token) {
    return {
      platform: "facebook",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshFacebookTokenIfNeeded(
    account as unknown as FacebookAccount,
    supabase
  );

  const profile = await fetchFacebookProfile(refreshed.access_token);
  const posts = await fetchFacebookPosts(refreshed.access_token);

  const normalizedProfile = normalizeFacebookProfile(profile);
  const normalizedPosts = posts.map(normalizeFacebookPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "facebook",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
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
    platform: "facebook",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type FacebookAccount = {
  access_token: string;
  user_id: string;
};

type RawFacebookProfile = {
  name?: string;
  picture?: { data?: { url?: string } };
  followers_count?: number;
};

type RawFacebookPost = {
  id: string;
  message?: string;
  full_picture?: string;
  likes?: number;
  comments?: number;
  created_time?: string;
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
   Placeholder Fetchers
------------------------------*/

async function refreshFacebookTokenIfNeeded(
  account: FacebookAccount,
  supabase: SupabaseClient<Database>
): Promise<FacebookAccount> {
  return account; // placeholder logic
}

async function fetchFacebookProfile(
  accessToken: string
): Promise<RawFacebookProfile> {
  return {
    name: "Placeholder Facebook Page",
    picture: { data: { url: "" } },
    followers_count: 0,
  };
}

async function fetchFacebookPosts(
  accessToken: string
): Promise<RawFacebookPost[]> {
  return [
    {
      id: "1",
      message: "Placeholder Facebook Post",
      full_picture: "",
      likes: 0,
      comments: 0,
      created_time: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeFacebookProfile(
  raw: RawFacebookProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.picture?.data?.url ?? "",
    followers: raw.followers_count ?? 0,
  };
}

function normalizeFacebookPost(
  raw: RawFacebookPost
): NormalizedPost {
  return {
    platform: "facebook",
    post_id: raw.id,
    caption: raw.message ?? "",
    media_url: raw.full_picture ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_time ?? new Date().toISOString(),
  };
}