// lib/socials/spotify.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncSpotify(
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
      platform: "spotify",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Spotify refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshSpotifyTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchSpotifyProfile(refreshed.access_token);
  const posts = await fetchSpotifyTracks(refreshed.access_token);

  const normalizedProfile = normalizeSpotifyProfile(profile);
  const normalizedPosts = posts.map(normalizeSpotifyTrack);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "spotify",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Spotify does not expose following count
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
    platform: "spotify",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawSpotifyProfile = {
  display_name?: string;
  images?: { url?: string }[];
  followers?: { total?: number };
};

type RawSpotifyTrack = {
  id: string;
  name?: string;
  album?: { images?: { url?: string }[] };
  popularity?: number;
  played_at?: string;
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

async function refreshSpotifyTokenIfNeeded(
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

async function fetchSpotifyProfile(
  accessToken: string
): Promise<RawSpotifyProfile> {
  return {
    display_name: "placeholder",
    images: [{ url: "" }],
    followers: { total: 0 },
  };
}

async function fetchSpotifyTracks(
  accessToken: string
): Promise<RawSpotifyTrack[]> {
  return [
    {
      id: "1",
      name: "Placeholder Track",
      album: { images: [{ url: "" }] },
      popularity: 0,
      played_at: new Date().toISOString(),
    },
  ];
}

function normalizeSpotifyProfile(
  raw: RawSpotifyProfile
): NormalizedProfile {
  return {
    username: raw.display_name ?? "",
    avatar_url: raw.images?.[0]?.url ?? "",
    followers: raw.followers?.total ?? 0,
  };
}

function normalizeSpotifyTrack(
  raw: RawSpotifyTrack
): NormalizedPost {
  return {
    platform: "spotify",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.album?.images?.[0]?.url ?? "",
    likes: raw.popularity ?? 0,
    comments: 0,
    posted_at: raw.played_at ?? new Date().toISOString(),
  };
}