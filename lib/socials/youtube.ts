// lib/socials/youtube.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncYouTube(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { access_token, user_id } = account as unknown as {
    access_token: string;
    user_id: string;
  };

  if (!access_token) {
    return {
      platform: "youtube",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshYouTubeTokenIfNeeded(
    account as unknown as YouTubeAccount,
    supabase
  );

  const profile = await fetchYouTubeProfile(refreshed.access_token);
  const posts = await fetchYouTubeVideos(refreshed.access_token);

  const normalizedProfile = normalizeYouTubeProfile(profile);
  const normalizedPosts = posts.map(normalizeYouTubeVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "youtube",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.subscribers,
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
    platform: "youtube",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type YouTubeAccount = {
  access_token: string;
  refresh_token?: string;
  user_id: string;
};

type RawYouTubeProfile = {
  title?: string;
  thumbnail?: string;
  subscriberCount?: number;
};

type RawYouTubeVideo = {
  id: string;
  title?: string;
  thumbnail?: string;
  likeCount?: number;
  commentCount?: number;
  publishedAt?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
  subscribers: number;
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

async function refreshYouTubeTokenIfNeeded(
  account: YouTubeAccount,
  supabase: SupabaseClient<Database>
): Promise<YouTubeAccount> {
  return account; // placeholder logic
}

async function fetchYouTubeProfile(
  accessToken: string
): Promise<RawYouTubeProfile> {
  return {
    title: "Placeholder Channel",
    thumbnail: "",
    subscriberCount: 0,
  };
}

async function fetchYouTubeVideos(
  accessToken: string
): Promise<RawYouTubeVideo[]> {
  return [
    {
      id: "1",
      title: "Placeholder Video",
      thumbnail: "",
      likeCount: 0,
      commentCount: 0,
      publishedAt: new Date().toISOString(),
    },
  ];
}

function normalizeYouTubeProfile(
  raw: RawYouTubeProfile
): NormalizedProfile {
  return {
    username: raw.title ?? "",
    avatar_url: raw.thumbnail ?? "",
    subscribers: raw.subscriberCount ?? 0,
  };
}

function normalizeYouTubeVideo(
  raw: RawYouTubeVideo
): NormalizedPost {
  return {
    platform: "youtube",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail ?? "",
    likes: raw.likeCount ?? 0,
    comments: raw.commentCount ?? 0,
    posted_at: raw.publishedAt ?? new Date().toISOString(),
  };
}