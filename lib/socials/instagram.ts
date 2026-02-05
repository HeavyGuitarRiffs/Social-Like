// lib/socials/instagram.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncInstagram(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { access_token, user_id } = account as unknown as {
    access_token: string;
    user_id: string;
  };

  // 1. Validate account
  if (!access_token) {
    return {
      platform: "instagram",
      updated: false,
      error: "Missing access token",
    };
  }

  // 2. Refresh token if needed
  const refreshed = await refreshInstagramTokenIfNeeded(
    account as unknown as InstagramAccount,
    supabase
  );

  // 3. Fetch profile data
  const profile = await fetchInstagramProfile(refreshed.access_token);

  // 4. Fetch latest posts
  const posts = await fetchInstagramPosts(refreshed.access_token);

  // 5. Normalize data
  const normalizedProfile = normalizeInstagramProfile(profile);
  const normalizedPosts = posts.map(normalizeInstagramPost);

  // 6. Write to Supabase
  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "instagram",
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

  // 7. Return sync summary
  return {
    platform: "instagram",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type InstagramAccount = {
  id?: string;
  access_token: string;
  refresh_token?: string;
  user_id: string;
};

type RawInstagramProfile = {
  username?: string;
  profile_picture?: string;
  followers_count?: number;
  follows_count?: number;
};

type RawInstagramPost = {
  id: string;
  caption?: string;
  media_url?: string;
  like_count?: number;
  comments_count?: number;
  timestamp?: string;
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
   Helpers (Stubbed)
------------------------------*/

async function refreshInstagramTokenIfNeeded(
  account: InstagramAccount,
  supabase: SupabaseClient<Database>
): Promise<InstagramAccount> {
  return account; // placeholder logic
}

async function fetchInstagramProfile(
  accessToken: string
): Promise<RawInstagramProfile> {
  return {
    username: "placeholder",
    profile_picture: "",
    followers_count: 0,
    follows_count: 0,
  };
}

async function fetchInstagramPosts(
  accessToken: string
): Promise<RawInstagramPost[]> {
  return [
    {
      id: "1",
      caption: "Placeholder post",
      media_url: "",
      like_count: 0,
      comments_count: 0,
      timestamp: new Date().toISOString(),
    },
  ];
}

function normalizeInstagramProfile(
  raw: RawInstagramProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.profile_picture ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.follows_count ?? 0,
  };
}

function normalizeInstagramPost(
  raw: RawInstagramPost
): NormalizedPost {
  return {
    platform: "instagram",
    post_id: raw.id,
    caption: raw.caption ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comments_count ?? 0,
    posted_at: raw.timestamp ?? new Date().toISOString(),
  };
}