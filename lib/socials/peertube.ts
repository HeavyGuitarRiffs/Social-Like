// lib/socials/peertube.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncPeertube(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    access_token,
    refresh_token,
    expires_at,
    instance_url,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
    instance_url: string;
  };

  if (!access_token || !instance_url) {
    return {
      platform: "peertube",
      updated: false,
      error: "Missing access token or instance URL",
      account_id,
    };
  }

  // Peertube refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshPeertubeTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at, instance_url },
    supabase
  );

  const profile = await fetchPeertubeProfile(
    refreshed.access_token,
    instance_url
  );

  const posts = await fetchPeertubeVideos(
    refreshed.access_token,
    instance_url
  );

  const normalizedProfile = normalizePeertubeProfile(profile);
  const normalizedPosts = posts.map(normalizePeertubeVideo);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "peertube",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Peertube does not expose following count
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
    platform: "peertube",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawPeertubeProfile = {
  displayName?: string;
  avatar?: string;
  followersCount?: number;
};

type RawPeertubeVideo = {
  id: string;
  name?: string;
  thumbnailPath?: string;
  likes?: number;
  comments?: number;
  createdAt?: string;
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

async function refreshPeertubeTokenIfNeeded(
  account: {
    account_id: string;
    user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
    instance_url: string;
  },
  supabase: SupabaseClient<Database>
) {
  return account; // placeholder logic
}

async function fetchPeertubeProfile(
  accessToken: string,
  instance: string
): Promise<RawPeertubeProfile> {
  return {
    displayName: "Placeholder Peertube User",
    avatar: "",
    followersCount: 0,
  };
}

async function fetchPeertubeVideos(
  accessToken: string,
  instance: string
): Promise<RawPeertubeVideo[]> {
  return [
    {
      id: "1",
      name: "Placeholder Peertube Video",
      thumbnailPath: "",
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    },
  ];
}

function normalizePeertubeProfile(
  raw: RawPeertubeProfile
): NormalizedProfile {
  return {
    username: raw.displayName ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followersCount ?? 0,
  };
}

function normalizePeertubeVideo(
  raw: RawPeertubeVideo
): NormalizedPost {
  return {
    platform: "peertube",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.thumbnailPath ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.createdAt ?? new Date().toISOString(),
  };
}