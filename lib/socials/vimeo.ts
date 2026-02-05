// lib/socials/vimeo.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncVimeo(
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
      platform: "vimeo",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  const refreshed = await refreshVimeoTokenIfNeeded(
    { account_id, user_id, access_token },
    supabase
  );

  const profile = await fetchVimeoProfile(refreshed.access_token);
  const posts = await fetchVimeoVideos(refreshed.access_token);

  const normalizedProfile = normalizeVimeoProfile(profile);
  const normalizedPosts = posts.map(normalizeVimeoVideo);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "vimeo",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Vimeo does not expose following count
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
    platform: "vimeo",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawVimeoProfile = {
  name?: string;
  pictures?: { base_link?: string };
  metadata?: { followers?: number };
};

type RawVimeoVideo = {
  id: string;
  name?: string;
  pictures?: { base_link?: string };
  likes?: { total?: number };
  comments?: { total?: number };
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
   Helpers
------------------------------*/

async function refreshVimeoTokenIfNeeded(
  account: {
    account_id: string;
    user_id: string;
    access_token: string;
  },
  supabase: SupabaseClient<Database>
) {
  return account; // placeholder logic
}

async function fetchVimeoProfile(
  accessToken: string
): Promise<RawVimeoProfile> {
  return {
    name: "Placeholder Vimeo Creator",
    pictures: { base_link: "" },
    metadata: { followers: 0 },
  };
}

async function fetchVimeoVideos(
  accessToken: string
): Promise<RawVimeoVideo[]> {
  return [
    {
      id: "1",
      name: "Placeholder Vimeo Video",
      pictures: { base_link: "" },
      likes: { total: 0 },
      comments: { total: 0 },
      created_time: new Date().toISOString(),
    },
  ];
}

function normalizeVimeoProfile(
  raw: RawVimeoProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.pictures?.base_link ?? "",
    followers: raw.metadata?.followers ?? 0,
  };
}

function normalizeVimeoVideo(
  raw: RawVimeoVideo
): NormalizedPost {
  return {
    platform: "vimeo",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.pictures?.base_link ?? "",
    likes: raw.likes?.total ?? 0,
    comments: raw.comments?.total ?? 0,
    posted_at: raw.created_time ?? new Date().toISOString(),
  };
}