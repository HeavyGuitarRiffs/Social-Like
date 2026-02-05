// lib/socials/artstation.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncArtStation(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { username, user_id } = account as unknown as {        // <-- username-based auth
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "artstation",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchArtStationProfile(username);
  const posts = await fetchArtStationProjects(username);

  const normalizedProfile = normalizeArtStationProfile(profile);
  const normalizedPosts = posts.map(normalizeArtStationProject);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "artstation",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
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
    platform: "artstation",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawArtStationProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawArtStationPost = {
  id: string;
  title?: string;
  cover_url?: string;
  likes?: number;
  comments?: number;
  published_at?: string;
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

async function fetchArtStationProfile(
  username: string
): Promise<RawArtStationProfile> {
  return {
    username: "Placeholder ArtStation Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchArtStationProjects(
  username: string
): Promise<RawArtStationPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder ArtStation Project",
      cover_url: "",
      likes: 0,
      comments: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizeArtStationProfile(
  raw: RawArtStationProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeArtStationProject(
  raw: RawArtStationPost
): NormalizedPost {
  return {
    platform: "artstation",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.cover_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}