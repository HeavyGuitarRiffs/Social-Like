// lib/socials/castbox.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncCastbox(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { username, user_id } = account as unknown as {        // <-- username-based auth
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "castbox",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchCastboxProfile(username);
  const posts = await fetchCastboxEpisodes(username);

  const normalizedProfile = normalizeCastboxProfile(profile);
  const normalizedPosts = posts.map(normalizeCastboxEpisode);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "castbox",
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
    platform: "castbox",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawCastboxProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawCastboxPost = {
  id: string;
  title?: string;
  audio_url?: string;
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

async function fetchCastboxProfile(
  username: string
): Promise<RawCastboxProfile> {
  return {
    username: "Placeholder Castbox Podcaster",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchCastboxEpisodes(
  username: string
): Promise<RawCastboxPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Castbox Episode",
      audio_url: "",
      plays: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeCastboxProfile(
  raw: RawCastboxProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeCastboxEpisode(
  raw: RawCastboxPost
): NormalizedPost {
  return {
    platform: "castbox",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.audio_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}