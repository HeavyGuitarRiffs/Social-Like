// lib/socials/ello.ts

import type { Account } from "./socialIndex";                 
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncEllo(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const { username, user_id } = account as unknown as {
    username: string;
    user_id: string;
  };

  if (!username) {
    return {
      platform: "ello",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchElloProfile(username);
  const posts = await fetchElloPosts(username);

  const normalizedProfile = normalizeElloProfile(profile);
  const normalizedPosts = posts.map(normalizeElloPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "ello",
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
    platform: "ello",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawElloProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawElloPost = {
  id: string;
  title?: string;
  image_url?: string;
  loves?: number;
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
   Placeholder Fetchers
------------------------------*/

async function fetchElloProfile(
  username: string
): Promise<RawElloProfile> {
  return {
    username: "Placeholder Ello Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchElloPosts(
  username: string
): Promise<RawElloPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Ello Post",
      image_url: "",
      loves: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

/* -----------------------------
   Normalizers
------------------------------*/

function normalizeElloProfile(
  raw: RawElloProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeElloPost(
  raw: RawElloPost
): NormalizedPost {
  return {
    platform: "ello",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.loves ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}