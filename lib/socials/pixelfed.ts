// lib/socials/pixelfed.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncPixelfed(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    access_token,
    instance_url,
    refresh_token,
    expires_at,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    access_token: string;
    instance_url: string;
    refresh_token?: string;
    expires_at?: number;
  };

  if (!access_token || !instance_url) {
    return {
      platform: "pixelfed",
      updated: false,
      error: "Missing access token or instance URL",
      account_id,
    };
  }

  // Pixelfed refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshPixelfedTokenIfNeeded(
    { account_id, user_id, access_token, instance_url, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchPixelfedProfile(
    refreshed.access_token,
    instance_url
  );

  const posts = await fetchPixelfedPosts(
    refreshed.access_token,
    instance_url
  );

  const normalizedProfile = normalizePixelfedProfile(profile);
  const normalizedPosts = posts.map(normalizePixelfedPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "pixelfed",
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
    platform: "pixelfed",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawPixelfedProfile = {
  username?: string;
  avatar?: string;
  followers?: number;
  following?: number;
};

type RawPixelfedPost = {
  id: string;
  caption?: string;
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

async function refreshPixelfedTokenIfNeeded(
  account: {
    account_id: string;
    user_id: string;
    access_token: string;
    instance_url: string;
    refresh_token?: string;
    expires_at?: number;
  },
  supabase: SupabaseClient<Database>
) {
  return account; // placeholder logic
}

async function fetchPixelfedProfile(
  accessToken: string,
  instance: string
): Promise<RawPixelfedProfile> {
  return {
    username: "Placeholder Pixelfed User",
    avatar: "",
    followers: 0,
    following: 0,
  };
}

async function fetchPixelfedPosts(
  accessToken: string,
  instance: string
): Promise<RawPixelfedPost[]> {
  return [
    {
      id: "1",
      caption: "Placeholder Pixelfed Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizePixelfedProfile(
  raw: RawPixelfedProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizePixelfedPost(
  raw: RawPixelfedPost
): NormalizedPost {
  return {
    platform: "pixelfed",
    post_id: raw.id,
    caption: raw.caption ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}