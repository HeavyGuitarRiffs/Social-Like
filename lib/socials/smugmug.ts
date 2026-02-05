// lib/socials/smugmug.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncSmugMug(
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
      platform: "smugmug",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  const profile = await fetchSmugMugProfile(access_token);
  const posts = await fetchSmugMugPhotos(access_token);

  const normalizedProfile = normalizeSmugMugProfile(profile);
  const normalizedPosts = posts.map(normalizeSmugMugPhoto);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "smugmug",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: 0, // SmugMug does not expose follower counts
    following: 0,
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
    platform: "smugmug",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawSmugMugProfile = {
  username?: string;
  avatar_url?: string;
};

type RawSmugMugPhoto = {
  id: string;
  title?: string;
  image_url?: string;
  views?: number;
  comments?: number;
  created_at?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
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

async function fetchSmugMugProfile(
  accessToken: string
): Promise<RawSmugMugProfile> {
  return {
    username: "Placeholder SmugMug Photographer",
    avatar_url: "",
  };
}

async function fetchSmugMugPhotos(
  accessToken: string
): Promise<RawSmugMugPhoto[]> {
  return [
    {
      id: "1",
      title: "Placeholder SmugMug Photo",
      image_url: "",
      views: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSmugMugProfile(
  raw: RawSmugMugProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
  };
}

function normalizeSmugMugPhoto(
  raw: RawSmugMugPhoto
): NormalizedPost {
  return {
    platform: "smugmug",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.views ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}