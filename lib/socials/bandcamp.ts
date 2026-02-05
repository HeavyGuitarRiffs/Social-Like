// lib/socials/bandcamp.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncBandcamp(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { username, user_id } = account as unknown as {        // <-- username-based auth
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "bandcamp",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchBandcampProfile(username);
  const posts = await fetchBandcampReleases(username);

  const normalizedProfile = normalizeBandcampProfile(profile);
  const normalizedPosts = posts.map(normalizeBandcampRelease);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "bandcamp",
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
    platform: "bandcamp",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawBandcampProfile = {
  username?: string;
  image_url?: string;
  followers?: number;
};

type RawBandcampPost = {
  id: string;
  title?: string;
  image_url?: string;
  plays?: number;
  comments?: number;
  released_at?: string;
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

async function fetchBandcampProfile(
  username: string
): Promise<RawBandcampProfile> {
  return {
    username: "Placeholder Bandcamp Artist",
    image_url: "",
    followers: 0,
  };
}

async function fetchBandcampReleases(
  username: string
): Promise<RawBandcampPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Bandcamp Release",
      image_url: "",
      plays: 0,
      comments: 0,
      released_at: new Date().toISOString(),
    },
  ];
}

function normalizeBandcampProfile(
  raw: RawBandcampProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.image_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeBandcampRelease(
  raw: RawBandcampPost
): NormalizedPost {
  return {
    platform: "bandcamp",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.released_at ?? new Date().toISOString(),
  };
}