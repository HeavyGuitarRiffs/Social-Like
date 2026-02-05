// lib/socials/flickr.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncFlickr(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { access_token, user_id } = account as unknown as {
    access_token: string;
    user_id: string;
  };

  if (!access_token) {
    return {
      platform: "flickr",
      updated: false,
      error: "Missing access token",
    };
  }

  const profile = await fetchFlickrProfile(access_token);
  const posts = await fetchFlickrPhotos(access_token);

  const normalizedProfile = normalizeFlickrProfile(profile);
  const normalizedPosts = posts.map(normalizeFlickrPhoto);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "flickr",
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
    platform: "flickr",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawFlickrProfile = {
  username?: string;
  icon_url?: string;
  followers?: number;
  following?: number;
};

type RawFlickrPhoto = {
  id: string;
  title?: string;
  url?: string;
  views?: number;
  comments?: number;
  posted_at?: string;
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
   Placeholder Fetchers
------------------------------*/

async function fetchFlickrProfile(
  accessToken: string
): Promise<RawFlickrProfile> {
  return {
    username: "Placeholder Flickr User",
    icon_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchFlickrPhotos(
  accessToken: string
): Promise<RawFlickrPhoto[]> {
  return [
    {
      id: "1",
      title: "Placeholder Flickr Photo",
      url: "",
      views: 0,
      comments: 0,
      posted_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeFlickrProfile(
  raw: RawFlickrProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.icon_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeFlickrPhoto(
  raw: RawFlickrPhoto
): NormalizedPost {
  return {
    platform: "flickr",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.url ?? "",
    likes: raw.views ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}