// lib/socials/vk.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncVK(
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
      platform: "vk",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  const refreshed = await refreshVKTokenIfNeeded(
    { account_id, user_id, access_token },
    supabase
  );

  const profile = await fetchVKProfile(refreshed.access_token);
  const posts = await fetchVKPosts(refreshed.access_token);

  const normalizedProfile = normalizeVKProfile(profile);
  const normalizedPosts = posts.map(normalizeVKPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "vk",
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
    platform: "vk",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawVKProfile = {
  first_name?: string;
  last_name?: string;
  photo_max?: string;
  followers_count?: number;
  friends_count?: number;
};

type RawVKPost = {
  id: string;
  text?: string;
  image_url?: string;
  likes?: { count?: number };
  comments?: { count?: number };
  date: number; // UNIX timestamp
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

async function refreshVKTokenIfNeeded(
  account: {
    account_id: string;
    user_id: string;
    access_token: string;
  },
  supabase: SupabaseClient<Database>
) {
  return account; // placeholder logic
}

async function fetchVKProfile(
  accessToken: string
): Promise<RawVKProfile> {
  return {
    first_name: "Placeholder",
    last_name: "User",
    photo_max: "",
    followers_count: 0,
    friends_count: 0,
  };
}

async function fetchVKPosts(
  accessToken: string
): Promise<RawVKPost[]> {
  return [
    {
      id: "1",
      text: "Placeholder VK Post",
      image_url: "",
      likes: { count: 0 },
      comments: { count: 0 },
      date: Date.now(),
    },
  ];
}

function normalizeVKProfile(
  raw: RawVKProfile
): NormalizedProfile {
  return {
    username: `${raw.first_name ?? ""} ${raw.last_name ?? ""}`.trim(),
    avatar_url: raw.photo_max ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.friends_count ?? 0,
  };
}

function normalizeVKPost(
  raw: RawVKPost
): NormalizedPost {
  return {
    platform: "vk",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes?.count ?? 0,
    comments: raw.comments?.count ?? 0,
    posted_at: new Date(raw.date).toISOString(),
  };
}