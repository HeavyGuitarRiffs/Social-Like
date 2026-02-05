// lib/socials/reverbnation.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncReverbNation(
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
      platform: "reverbnation",
      updated: false,
      error: "Missing username",
      account_id,
    };
  }

  const profile = await fetchReverbNationProfile(username);
  const posts = await fetchReverbNationSongs(username);

  const normalizedProfile = normalizeReverbNationProfile(profile);
  const normalizedPosts = posts.map(normalizeReverbNationSong);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "reverbnation",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // ReverbNation does not expose following count
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
    platform: "reverbnation",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawReverbNationProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawReverbNationSong = {
  id: string;
  title?: string;
  image_url?: string;
  plays?: number;
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

async function fetchReverbNationProfile(
  username: string
): Promise<RawReverbNationProfile> {
  return {
    username: "Placeholder ReverbNation Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchReverbNationSongs(
  username: string
): Promise<RawReverbNationSong[]> {
  return [
    {
      id: "1",
      title: "Placeholder ReverbNation Song",
      image_url: "",
      plays: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeReverbNationProfile(
  raw: RawReverbNationProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeReverbNationSong(
  raw: RawReverbNationSong
): NormalizedPost {
  return {
    platform: "reverbnation",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}