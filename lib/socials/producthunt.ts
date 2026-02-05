// lib/socials/producthunt.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncProductHunt(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    access_token,
    refresh_token,
    expires_at,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
  };

  if (!access_token) {
    return {
      platform: "producthunt",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Product Hunt refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshProductHuntTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchProductHuntProfile(refreshed.access_token);
  const posts = await fetchProductHuntPosts(refreshed.access_token);

  const normalizedProfile = normalizeProductHuntProfile(profile);
  const normalizedPosts = posts.map(normalizeProductHuntPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "producthunt",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Product Hunt does not expose following count
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
    platform: "producthunt",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawProductHuntProfile = {
  name?: string;
  avatar?: string;
  followers_count?: number;
};

type RawProductHuntPost = {
  id: string;
  name?: string;
  thumbnail?: { url?: string };
  votes_count?: number;
  comments_count?: number;
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

async function refreshProductHuntTokenIfNeeded(
  account: {
    account_id: string;
    user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
  },
  supabase: SupabaseClient<Database>
) {
  return account; // placeholder logic
}

async function fetchProductHuntProfile(
  accessToken: string
): Promise<RawProductHuntProfile> {
  return {
    name: "Placeholder Maker",
    avatar: "",
    followers_count: 0,
  };
}

async function fetchProductHuntPosts(
  accessToken: string
): Promise<RawProductHuntPost[]> {
  return [
    {
      id: "1",
      name: "Placeholder Launch",
      thumbnail: { url: "" },
      votes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeProductHuntProfile(
  raw: RawProductHuntProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers_count ?? 0,
  };
}

function normalizeProductHuntPost(
  raw: RawProductHuntPost
): NormalizedPost {
  return {
    platform: "producthunt",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.thumbnail?.url ?? "",
    likes: raw.votes_count ?? 0,
    comments: raw.comments_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}