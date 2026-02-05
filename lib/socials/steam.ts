// lib/socials/steam.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncSteam(
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
      platform: "steam",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Steam refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshSteamTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchSteamProfile(refreshed.access_token);
  const posts = await fetchSteamActivity(refreshed.access_token);

  const normalizedProfile = normalizeSteamProfile(profile);
  const normalizedPosts = posts.map(normalizeSteamEvent);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "steam",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Steam does not expose following count
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
    platform: "steam",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawSteamProfile = {
  personaname?: string;
  avatarfull?: string;
  followers?: number;
};

type RawSteamEvent = {
  id: string;
  game?: string;
  action?: string;
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

async function refreshSteamTokenIfNeeded(
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

async function fetchSteamProfile(
  accessToken: string
): Promise<RawSteamProfile> {
  return {
    personaname: "Placeholder Gamer",
    avatarfull: "",
    followers: 0,
  };
}

async function fetchSteamActivity(
  accessToken: string
): Promise<RawSteamEvent[]> {
  return [
    {
      id: "1",
      game: "Placeholder Game",
      action: "Played",
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSteamProfile(
  raw: RawSteamProfile
): NormalizedProfile {
  return {
    username: raw.personaname ?? "",
    avatar_url: raw.avatarfull ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeSteamEvent(
  raw: RawSteamEvent
): NormalizedPost {
  return {
    platform: "steam",
    post_id: raw.id,
    caption: `${raw.action ?? ""} ${raw.game ?? ""}`.trim(),
    media_url: "",
    likes: 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}