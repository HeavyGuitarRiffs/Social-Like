// lib/socials/bluesky.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncBluesky(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
) {
  const { access_token, user_id, did } = account as unknown as {
    access_token: string;
    user_id: string;
    did: string;
  };

  if (!access_token || !did) {
    return {
      platform: "bluesky",
      updated: false,
      error: "Missing access token or DID",
    };
  }

  const refreshed = await refreshBlueskyTokenIfNeeded(
    account as unknown as BlueskyAccount,                     // <-- Bluesky-specific fields
    supabase
  );

  const profile = await fetchBlueskyProfile(refreshed.access_token, did);
  const posts = await fetchBlueskyPosts(refreshed.access_token, did);

  const normalizedProfile = normalizeBlueskyProfile(profile);
  const normalizedPosts = posts.map(normalizeBlueskyPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "bluesky",
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
    platform: "bluesky",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type BlueskyAccount = {
  access_token: string;
  user_id: string;
  did: string;
};

type RawBlueskyProfile = {
  handle?: string;
  avatar?: string;
  followersCount?: number;
  followsCount?: number;
};

type RawBlueskyPost = {
  uri: string;
  text?: string;
  embed?: {
    images?: { fullsize?: string }[];
  } | null;
  likeCount?: number;
  replyCount?: number;
  createdAt?: string;
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

async function refreshBlueskyTokenIfNeeded(
  account: BlueskyAccount,
  supabase: SupabaseClient<Database>
): Promise<BlueskyAccount> {
  return account; // placeholder logic
}

async function fetchBlueskyProfile(
  accessToken: string,
  did: string
): Promise<RawBlueskyProfile> {
  return {
    handle: "placeholder.bsky.social",
    avatar: "",
    followersCount: 0,
    followsCount: 0,
  };
}

async function fetchBlueskyPosts(
  accessToken: string,
  did: string
): Promise<RawBlueskyPost[]> {
  return [
    {
      uri: "1",
      text: "Placeholder Bluesky Post",
      embed: null,
      likeCount: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
    },
  ];
}

function normalizeBlueskyProfile(
  raw: RawBlueskyProfile
): NormalizedProfile {
  return {
    username: raw.handle ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followersCount ?? 0,
    following: raw.followsCount ?? 0,
  };
}

function normalizeBlueskyPost(
  raw: RawBlueskyPost
): NormalizedPost {
  return {
    platform: "bluesky",
    post_id: raw.uri,
    caption: raw.text ?? "",
    media_url: raw.embed?.images?.[0]?.fullsize ?? "",
    likes: raw.likeCount ?? 0,
    comments: raw.replyCount ?? 0,
    posted_at: raw.createdAt ?? new Date().toISOString(),
  };
}