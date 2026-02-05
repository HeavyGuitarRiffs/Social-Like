// lib/socials/artfol.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncArtfol(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { username, user_id } = account as unknown as {        // <-- username-based auth
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "artfol",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchArtfolProfile(username);
  const posts = await fetchArtfolPosts(username);

  const normalizedProfile = normalizeArtfolProfile(profile);
  const normalizedPosts = posts.map(normalizeArtfolPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "artfol",
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
    platform: "artfol",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawArtfolProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawArtfolPost = {
  id: string;
  title?: string;
  image_url?: string;
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

async function fetchArtfolProfile(
  username: string
): Promise<RawArtfolProfile> {
  return {
    username: "Placeholder Artfol Artist",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchArtfolPosts(
  username: string
): Promise<RawArtfolPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Artfol Post",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeArtfolProfile(
  raw: RawArtfolProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeArtfolPost(
  raw: RawArtfolPost
): NormalizedPost {
  return {
    platform: "artfol",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}