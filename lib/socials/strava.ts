// lib/socials/strava.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncStrava(
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
      platform: "strava",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Strava refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshStravaTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchStravaProfile(refreshed.access_token);
  const posts = await fetchStravaActivities(refreshed.access_token);

  const normalizedProfile = normalizeStravaProfile(profile);
  const normalizedPosts = posts.map(normalizeStravaActivity);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "strava",
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
    platform: "strava",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawStravaProfile = {
  username?: string;
  profile?: string;
  follower_count?: number;
  friend_count?: number;
};

type RawStravaActivity = {
  id: string;
  name?: string;
  distance?: number;
  moving_time?: number;
  start_date?: string;
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

async function refreshStravaTokenIfNeeded(
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

async function fetchStravaProfile(
  accessToken: string
): Promise<RawStravaProfile> {
  return {
    username: "Placeholder Athlete",
    profile: "",
    follower_count: 0,
    friend_count: 0,
  };
}

async function fetchStravaActivities(
  accessToken: string
): Promise<RawStravaActivity[]> {
  return [
    {
      id: "1",
      name: "Placeholder Run",
      distance: 5000,
      moving_time: 1500,
      start_date: new Date().toISOString(),
    },
  ];
}

function normalizeStravaProfile(
  raw: RawStravaProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.profile ?? "",
    followers: raw.follower_count ?? 0,
    following: raw.friend_count ?? 0,
  };
}

function normalizeStravaActivity(
  raw: RawStravaActivity
): NormalizedPost {
  return {
    platform: "strava",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: "",
    likes: 0,
    comments: 0,
    posted_at: raw.start_date ?? new Date().toISOString(),
  };
}