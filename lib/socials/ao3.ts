// lib/socials/ao3.ts

import type { Account } from "./socialIndex";                 // <-- UNIVERSAL TYPE
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncAo3(
  account: Account,                                           // <-- FIXED
  supabase: SupabaseClient<Database>                          // <-- FIXED
): Promise<SyncResult> {
  const { username, user_id } = account as unknown as {        // <-- AO3 uses username instead of access_token
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "ao3",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchAo3Profile(username);
  const works = await fetchAo3Works(username);

  const normalizedProfile = normalizeAo3Profile(profile);
  const normalizedPosts = works.map(normalizeAo3Work);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "ao3",
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
    platform: "ao3",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type SyncResult = {
  platform: string;
  updated: boolean;
  posts?: number;
  metrics?: boolean;
  error?: string;
};

type RawAo3Profile = {
  username?: string;
  works_count?: number;
  bookmarks_count?: number;
};

type RawAo3Work = {
  id: string;
  title?: string;
  summary?: string;
  kudos?: number;
  comments?: number;
  published_at?: string;
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

async function fetchAo3Profile(username: string): Promise<RawAo3Profile> {
  return {
    username: "Placeholder AO3 Author",
    works_count: 0,
    bookmarks_count: 0,
  };
}

async function fetchAo3Works(username: string): Promise<RawAo3Work[]> {
  return [
    {
      id: "1",
      title: "Placeholder AO3 Work",
      summary: "Summary text",
      kudos: 0,
      comments: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizeAo3Profile(raw: RawAo3Profile): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: "", // AO3 has no avatars
    followers: raw.works_count ?? 0,
    following: raw.bookmarks_count ?? 0,
  };
}

function normalizeAo3Work(raw: RawAo3Work): NormalizedPost {
  return {
    platform: "ao3",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: "", // AO3 has no media URLs
    likes: raw.kudos ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}