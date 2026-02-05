// lib/socials/discord.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncDiscord(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "discord",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshDiscordTokenIfNeeded(
    account as unknown as DiscordAccount,                     // <-- Discord-specific fields
    supabase
  );

  const profile = await fetchDiscordProfile(refreshed.access_token);
  const posts = await fetchDiscordActivity(refreshed.access_token);

  const normalizedProfile = normalizeDiscordProfile(profile);
  const normalizedPosts = posts.map(normalizeDiscordActivity);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "discord",
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
    platform: "discord",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type DiscordAccount = {
  access_token: string;
  user_id: string;
};

type RawDiscordProfile = {
  username?: string;
  avatar?: string;
  followers?: number;
};

type RawDiscordPost = {
  id: string;
  content?: string;
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

async function refreshDiscordTokenIfNeeded(
  account: DiscordAccount,
  supabase: SupabaseClient<Database>
): Promise<DiscordAccount> {
  return account; // placeholder logic
}

async function fetchDiscordProfile(
  accessToken: string
): Promise<RawDiscordProfile> {
  return {
    username: "placeholder",
    avatar: "",
    followers: 0,
  };
}

async function fetchDiscordActivity(
  accessToken: string
): Promise<RawDiscordPost[]> {
  return [
    {
      id: "1",
      content: "Placeholder Discord message",
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeDiscordProfile(
  raw: RawDiscordProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeDiscordActivity(
  raw: RawDiscordPost
): NormalizedPost {
  return {
    platform: "discord",
    post_id: raw.id,
    caption: raw.content ?? "",
    media_url: "",
    likes: 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}