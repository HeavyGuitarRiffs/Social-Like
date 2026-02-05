// lib/socials/vocalmedia.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncVocalMedia(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    username,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    username: string;
  };

  if (!username) {
    return {
      platform: "vocalmedia",
      updated: false,
      error: "Missing username",
      account_id,
    };
  }

  const profile = await fetchVocalMediaProfile(username);
  const posts = await fetchVocalMediaStories(username);

  const normalizedProfile = normalizeVocalMediaProfile(profile);
  const normalizedPosts = posts.map(normalizeVocalMediaStory);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "vocalmedia",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Vocal Media does not expose following count
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
    platform: "vocalmedia",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawVocalMediaProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawVocalMediaStory = {
  id: string;
  title?: string;
  image_url?: string;
  reads?: number;
  comments?: number;
  created_at?: string;
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

async function fetchVocalMediaProfile(
  username: string
): Promise<RawVocalMediaProfile> {
  return {
    username: "Placeholder Vocal Writer",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchVocalMediaStories(
  username: string
): Promise<RawVocalMediaStory[]> {
  return [
    {
      id: "1",
      title: "Placeholder Vocal Story",
      image_url: "",
      reads: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeVocalMediaProfile(
  raw: RawVocalMediaProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeVocalMediaStory(
  raw: RawVocalMediaStory
): NormalizedPost {
  return {
    platform: "vocalmedia",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.reads ?? 0, // reads = likes in your schema
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}