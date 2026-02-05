// lib/socials/linkedin.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncLinkedIn(
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
      platform: "linkedin",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Standardized token refresh pattern
  const refreshed = await refreshLinkedInTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchLinkedInProfile(refreshed.access_token);
  const posts = await fetchLinkedInPosts(refreshed.access_token);

  const normalizedProfile = normalizeLinkedInProfile(profile);
  const normalizedPosts = posts.map(normalizeLinkedInPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "linkedin",
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
    platform: "linkedin",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawLinkedInProfile = {
  localizedFirstName?: string;
  localizedLastName?: string;
  profilePicture?: string;
  followerCount?: number;
  followingCount?: number;
};

type RawLinkedInPost = {
  id: string;
  text?: string;
  media_url?: string;
  like_count?: number;
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

async function refreshLinkedInTokenIfNeeded(
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

async function fetchLinkedInProfile(
  accessToken: string
): Promise<RawLinkedInProfile> {
  return {
    localizedFirstName: "Placeholder",
    localizedLastName: "User",
    profilePicture: "",
    followerCount: 0,
    followingCount: 0,
  };
}

async function fetchLinkedInPosts(
  accessToken: string
): Promise<RawLinkedInPost[]> {
  return [
    {
      id: "1",
      text: "Placeholder LinkedIn post",
      media_url: "",
      like_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeLinkedInProfile(
  raw: RawLinkedInProfile
): NormalizedProfile {
  return {
    username: `${raw.localizedFirstName ?? ""} ${raw.localizedLastName ?? ""}`.trim(),
    avatar_url: raw.profilePicture ?? "",
    followers: raw.followerCount ?? 0,
    following: raw.followingCount ?? 0,
  };
}

function normalizeLinkedInPost(
  raw: RawLinkedInPost
): NormalizedPost {
  return {
    platform: "linkedin",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}