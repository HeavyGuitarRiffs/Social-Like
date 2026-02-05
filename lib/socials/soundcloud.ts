// lib/socials/soundcloud.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncSoundCloud(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    access_token,
    refresh_token,
    expires_at,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
  };

  if (!access_token) {
    return {
      platform: "soundcloud",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // SoundCloud refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshSoundCloudTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchSoundCloudProfile(refreshed.access_token);
  const posts = await fetchSoundCloudTracks(refreshed.access_token);

  const normalizedProfile = normalizeSoundCloudProfile(profile);
  const normalizedPosts = posts.map(normalizeSoundCloudTrack);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "soundcloud",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
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
    platform: "soundcloud",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawSoundCloudProfile = {
  username?: string;
  avatar_url?: string;
  followers_count?: number;
  following_count?: number;
};

type RawSoundCloudTrack = {
  id: string;
  title?: string;
  artwork_url?: string;
  playback_count?: number;
  comment_count?: number;
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

async function refreshSoundCloudTokenIfNeeded(
  account: {
    account_id: string;
    user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
  },
  supabase: SupabaseClient<Database>
) {
  return account; // placeholder logic
}

async function fetchSoundCloudProfile(
  accessToken: string
): Promise<RawSoundCloudProfile> {
  return {
    username: "Placeholder Artist",
    avatar_url: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchSoundCloudTracks(
  accessToken: string
): Promise<RawSoundCloudTrack[]> {
  return [
    {
      id: "1",
      title: "Placeholder Track",
      artwork_url: "",
      playback_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSoundCloudProfile(
  raw: RawSoundCloudProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeSoundCloudTrack(
  raw: RawSoundCloudTrack
): NormalizedPost {
  return {
    platform: "soundcloud",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.artwork_url ?? "",
    likes: raw.playback_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}