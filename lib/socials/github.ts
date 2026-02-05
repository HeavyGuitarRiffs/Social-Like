// lib/socials/github.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncGitHub(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { access_token, user_id } = account as unknown as {
    access_token: string;
    user_id: string;
  };

  if (!access_token) {
    return {
      platform: "github",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshGitHubTokenIfNeeded(
    account as unknown as GitHubAccount,
    supabase
  );

  const profile = await fetchGitHubProfile(refreshed.access_token);
  const posts = await fetchGitHubActivity(refreshed.access_token);

  const normalizedProfile = normalizeGitHubProfile(profile);
  const normalizedPosts = posts.map(normalizeGitHubEvent);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "github",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
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
    platform: "github",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type GitHubAccount = {
  access_token: string;
  user_id: string;
};

type RawGitHubProfile = {
  login?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
};

type RawGitHubEvent = {
  id: string;
  type?: string;
  repo?: { name?: string };
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

async function refreshGitHubTokenIfNeeded(
  account: GitHubAccount,
  supabase: SupabaseClient<Database>
): Promise<GitHubAccount> {
  return account; // placeholder logic
}

async function fetchGitHubProfile(
  accessToken: string
): Promise<RawGitHubProfile> {
  return {
    login: "placeholder",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchGitHubActivity(
  accessToken: string
): Promise<RawGitHubEvent[]> {
  return [
    {
      id: "1",
      type: "PushEvent",
      repo: { name: "placeholder/repo" },
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeGitHubProfile(
  raw: RawGitHubProfile
): NormalizedProfile {
  return {
    username: raw.login ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeGitHubEvent(
  raw: RawGitHubEvent
): NormalizedPost {
  return {
    platform: "github",
    post_id: raw.id,
    caption: `${raw.type ?? "Event"} in ${raw.repo?.name ?? ""}`,
    media_url: "",
    likes: 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}