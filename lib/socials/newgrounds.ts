// lib/socials/newgrounds.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncNewgrounds(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    username,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    username: string;
  };

  if (!username) {
    return {
      platform: "newgrounds",
      updated: false,
      error: "Missing username",
      account_id,
    };
  }

  const profile = await fetchNewgroundsProfile(username);
  const posts = await fetchNewgroundsContent(username);

  const normalizedProfile = normalizeNewgroundsProfile(profile);
  const normalizedPosts = posts.map(normalizeNewgroundsPost);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "newgrounds",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Newgrounds does not expose following count
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
    platform: "newgrounds",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawNewgroundsProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawNewgroundsPost = {
  id: string;
  title?: string;
  media_url?: string;
  likes?: number;
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
   Helpers
------------------------------*/

async function fetchNewgroundsProfile(
  username: string
): Promise<RawNewgroundsProfile> {
  return {
    username: "Placeholder Newgrounds Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchNewgroundsContent(
  username: string
): Promise<RawNewgroundsPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Newgrounds Upload",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeNewgroundsProfile(
  raw: RawNewgroundsProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeNewgroundsPost(
  raw: RawNewgroundsPost
): NormalizedPost {
  return {
    platform: "newgrounds",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}