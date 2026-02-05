// lib/socials/soundclick.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncSoundClick(
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
      platform: "soundclick",
      updated: false,
      error: "Missing username",
      account_id,
    };
  }

  const profile = await fetchSoundClickProfile(username);
  const posts = await fetchSoundClickSongs(username);

  const normalizedProfile = normalizeSoundClickProfile(profile);
  const normalizedPosts = posts.map(normalizeSoundClickSong);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "soundclick",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // SoundClick does not expose following count
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
    platform: "soundclick",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawSoundClickProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawSoundClickSong = {
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

async function fetchSoundClickProfile(
  username: string
): Promise<RawSoundClickProfile> {
  return {
    username: "Placeholder SoundClick Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchSoundClickSongs(
  username: string
): Promise<RawSoundClickSong[]> {
  return [
    {
      id: "1",
      title: "Placeholder SoundClick Song",
      image_url: "",
      plays: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSoundClickProfile(
  raw: RawSoundClickProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeSoundClickSong(
  raw: RawSoundClickSong
): NormalizedPost {
  return {
    platform: "soundclick",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}