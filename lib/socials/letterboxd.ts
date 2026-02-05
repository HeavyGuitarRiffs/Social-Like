// lib/socials/letterboxd.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncLetterboxd(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { username, user_id } = account as unknown as {
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "letterboxd",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchLetterboxdProfile(username);
  const posts = await fetchLetterboxdReviews(username);

  const normalizedProfile = normalizeLetterboxdProfile(profile);
  const normalizedPosts = posts.map(normalizeLetterboxdReview);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "letterboxd",
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
    platform: "letterboxd",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawLetterboxdProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawLetterboxdReview = {
  id: string;
  film?: string;
  review?: string;
  rating?: number;
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
   Placeholder Fetchers
------------------------------*/

async function fetchLetterboxdProfile(
  username: string
): Promise<RawLetterboxdProfile> {
  return {
    username: "Placeholder Letterboxd User",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchLetterboxdReviews(
  username: string
): Promise<RawLetterboxdReview[]> {
  return [
    {
      id: "1",
      film: "Placeholder Film",
      review: "Placeholder review",
      rating: 4,
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeLetterboxdProfile(
  raw: RawLetterboxdProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeLetterboxdReview(
  raw: RawLetterboxdReview
): NormalizedPost {
  return {
    platform: "letterboxd",
    post_id: raw.id,
    caption: `${raw.film ?? ""}: ${raw.review ?? ""}`,
    media_url: "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}