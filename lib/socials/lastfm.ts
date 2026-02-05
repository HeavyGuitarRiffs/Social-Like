// lib/socials/lastfm.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncLastfm(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { username, user_id } = account as unknown as {
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "lastfm",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchLastfmProfile(username);
  const posts = await fetchLastfmRecentTracks(username);

  const normalizedProfile = normalizeLastfmProfile(profile);
  const normalizedPosts = posts.map(normalizeLastfmTrack);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "lastfm",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: 0,
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
    platform: "lastfm",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawLastfmProfile = {
  username?: string;
  avatar_url?: string;
};

type RawLastfmTrack = {
  id: string;
  track?: string;
  artist?: string;
  album_art?: string;
  playcount?: number;
  created_at?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
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

async function fetchLastfmProfile(
  username: string
): Promise<RawLastfmProfile> {
  return {
    username: "Placeholder Last.fm User",
    avatar_url: "",
  };
}

async function fetchLastfmRecentTracks(
  username: string
): Promise<RawLastfmTrack[]> {
  return [
    {
      id: "1",
      track: "Placeholder Track",
      artist: "Placeholder Artist",
      album_art: "",
      playcount: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeLastfmProfile(
  raw: RawLastfmProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
  };
}

function normalizeLastfmTrack(
  raw: RawLastfmTrack
): NormalizedPost {
  return {
    platform: "lastfm",
    post_id: raw.id,
    caption: `${raw.track ?? ""} — ${raw.artist ?? ""}`,
    media_url: raw.album_art ?? "",
    likes: raw.playcount ?? 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}