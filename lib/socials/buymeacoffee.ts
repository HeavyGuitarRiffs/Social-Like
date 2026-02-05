// lib/socials/buymeacoffee.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncBuyMeACoffee(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { username, user_id } = account as unknown as {        // <-- username-based auth
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "buymeacoffee",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchBuyMeACoffeeProfile(username);
  const posts = await fetchBuyMeACoffeePosts(username);

  const normalizedProfile = normalizeBuyMeACoffeeProfile(profile);
  const normalizedPosts = posts.map(normalizeBuyMeACoffeePost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "buymeacoffee",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.supporters,   // <-- supporters → followers
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
    platform: "buymeacoffee",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawBuyMeACoffeeProfile = {
  username?: string;
  avatar_url?: string;
  supporters?: number;
};

type RawBuyMeACoffeePost = {
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
  supporters: number;
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

async function fetchBuyMeACoffeeProfile(
  username: string
): Promise<RawBuyMeACoffeeProfile> {
  return {
    username: "Placeholder BMC Creator",
    avatar_url: "",
    supporters: 0,
  };
}

async function fetchBuyMeACoffeePosts(
  username: string
): Promise<RawBuyMeACoffeePost[]> {
  return [
    {
      id: "1",
      title: "Placeholder BMC Post",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeBuyMeACoffeeProfile(
  raw: RawBuyMeACoffeeProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    supporters: raw.supporters ?? 0,
  };
}

function normalizeBuyMeACoffeePost(
  raw: RawBuyMeACoffeePost
): NormalizedPost {
  return {
    platform: "buymeacoffee",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}