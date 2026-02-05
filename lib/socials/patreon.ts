// lib/socials/patreon.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncPatreon(
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
      platform: "patreon",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  // Patreon refresh placeholder (kept consistent with universal pattern)
  const refreshed = await refreshPatreonTokenIfNeeded(
    { account_id, user_id, access_token, refresh_token, expires_at },
    supabase
  );

  const profile = await fetchPatreonProfile(refreshed.access_token);
  const posts = await fetchPatreonPosts(refreshed.access_token);

  const normalizedProfile = normalizePatreonProfile(profile);
  const normalizedPosts = posts.map(normalizePatreonPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "patreon",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.patrons,
    following: 0, // Patreon does not expose following count
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
    platform: "patreon",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawPatreonProfile = {
  full_name?: string;
  image_url?: string;
  patron_count?: number;
};

type RawPatreonPost = {
  id: string;
  title?: string;
  content?: string;
  like_count?: number;
  comment_count?: number;
  published_at?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
  patrons: number;
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

async function refreshPatreonTokenIfNeeded(
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

async function fetchPatreonProfile(
  accessToken: string
): Promise<RawPatreonProfile> {
  return {
    full_name: "Placeholder Creator",
    image_url: "",
    patron_count: 0,
  };
}

async function fetchPatreonPosts(
  accessToken: string
): Promise<RawPatreonPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Patreon Post",
      content: "",
      like_count: 0,
      comment_count: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizePatreonProfile(
  raw: RawPatreonProfile
): NormalizedProfile {
  return {
    username: raw.full_name ?? "",
    avatar_url: raw.image_url ?? "",
    patrons: raw.patron_count ?? 0,
  };
}

function normalizePatreonPost(
  raw: RawPatreonPost
): NormalizedPost {
  return {
    platform: "patreon",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: "", // Patreon posts may include attachments, but placeholder logic keeps it empty
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}