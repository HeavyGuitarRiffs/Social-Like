// lib/socials/mastodon.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncMastodon(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    access_token,
    refresh_token,
    expires_at,
    instance_url,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
    instance_url: string;
  };

  if (!access_token || !instance_url) {
    return {
      platform: "mastodon",
      updated: false,
      error: "Missing access token or instance URL",
      account_id,
    };
  }

  // Standardized token refresh pattern
  const refreshed = await refreshMastodonTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at, instance_url },
    supabase
  );

  const profile = await fetchMastodonProfile(
    refreshed.access_token,
    instance_url
  );

  const posts = await fetchMastodonStatuses(
    refreshed.access_token,
    instance_url
  );

  const normalizedProfile = normalizeMastodonProfile(profile);
  const normalizedPosts = posts.map(normalizeMastodonStatus);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "mastodon",
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
    platform: "mastodon",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawMastodonProfile = {
  username?: string;
  avatar?: string;
  followers_count?: number;
  following_count?: number;
};

type RawMastodonStatus = {
  id: string;
  content?: string;
  media_attachments?: Array<{ url?: string }>;
  favourites_count?: number;
  replies_count?: number;
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

async function refreshMastodonTokenIfNeeded(
  account: {
    account_id: string;
    user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
    instance_url: string;
  },
  supabase: SupabaseClient<Database>
) {
  return account; // placeholder logic
}

async function fetchMastodonProfile(
  accessToken: string,
  instance: string
): Promise<RawMastodonProfile> {
  return {
    username: "placeholder",
    avatar: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchMastodonStatuses(
  accessToken: string,
  instance: string
): Promise<RawMastodonStatus[]> {
  return [
    {
      id: "1",
      content: "Placeholder Mastodon Toot",
      media_attachments: [],
      favourites_count: 0,
      replies_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeMastodonProfile(
  raw: RawMastodonProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeMastodonStatus(
  raw: RawMastodonStatus
): NormalizedPost {
  return {
    platform: "mastodon",
    post_id: raw.id,
    caption: raw.content ?? "",
    media_url: raw.media_attachments?.[0]?.url ?? "",
    likes: raw.favourites_count ?? 0,
    comments: raw.replies_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}