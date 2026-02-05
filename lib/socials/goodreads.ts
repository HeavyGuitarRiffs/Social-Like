// lib/socials/goodreads.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncGoodreads(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { username, user_id } = account as unknown as {
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "goodreads",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchGoodreadsProfile(username);
  const posts = await fetchGoodreadsReviews(username);

  const normalizedProfile = normalizeGoodreadsProfile(profile);
  const normalizedPosts = posts.map(normalizeGoodreadsReview);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "goodreads",
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
    platform: "goodreads",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawGoodreadsProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawGoodreadsReview = {
  id: string;
  book?: string;
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

async function fetchGoodreadsProfile(
  username: string
): Promise<RawGoodreadsProfile> {
  return {
    username: "Placeholder Goodreads User",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchGoodreadsReviews(
  username: string
): Promise<RawGoodreadsReview[]> {
  return [
    {
      id: "1",
      book: "Placeholder Book",
      review: "Placeholder review",
      rating: 5,
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeGoodreadsProfile(
  raw: RawGoodreadsProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeGoodreadsReview(
  raw: RawGoodreadsReview
): NormalizedPost {
  return {
    platform: "goodreads",
    post_id: raw.id,
    caption: `${raw.book ?? ""}: ${raw.review ?? ""}`,
    media_url: "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}