// lib/socials/audiomack.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncAudiomack(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { username, user_id } = account as unknown as {        // <-- username-based auth
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "audiomack",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchAudiomackProfile(username);
  const posts = await fetchAudiomackUploads(username);

  const normalizedProfile = normalizeAudiomackProfile(profile);
  const normalizedPosts = posts.map(normalizeAudiomackUpload);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "audiomack",
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
    platform: "audiomack",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawAudiomackProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawAudiomackPost = {
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

async function fetchAudiomackProfile(
  username: string
): Promise<RawAudiomackProfile> {
  return {
    username: "Placeholder Audiomack Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchAudiomackUploads(
  username: string
): Promise<RawAudiomackPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Audiomack Upload",
      image_url: "",
      plays: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeAudiomackProfile(
  raw: RawAudiomackProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeAudiomackUpload(
  raw: RawAudiomackPost
): NormalizedPost {
  return {
    platform: "audiomack",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}