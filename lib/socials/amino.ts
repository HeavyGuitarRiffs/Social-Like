// lib/socials/amino.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

type AminoAccount = {
  access_token: string | null;
  user_id: string;
};

type AminoProfile = {
  username: string;
  avatar_url: string;
  followers: number;
  following: number;
};

type AminoPost = {
  id: string;
  title: string;
  media_url: string;
  likes: number;
  comments: number;
  created_at: string;
};

export async function syncAmino(
  account: AminoAccount,
  supabase: SupabaseClient<Database>
) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "amino",
      updated: false,
      error: "Missing access token"
    };
  }

  const profile = await fetchAminoProfile(access_token);
  const posts = await fetchAminoPosts(access_token);

  const normalizedProfile = normalizeAminoProfile(profile);

  const normalizedPosts = posts.map((p) => ({
    user_id,
    ...normalizeAminoPost(p)
  }));

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "amino",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "amino",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true
  };
}

/* -------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------- */

async function fetchAminoProfile(accessToken: string): Promise<AminoProfile> {
  return {
    username: "Placeholder Amino User",
    avatar_url: "",
    followers: 0,
    following: 0
  };
}

async function fetchAminoPosts(accessToken: string): Promise<AminoPost[]> {
  return [
    {
      id: "1",
      title: "Placeholder Amino Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeAminoProfile(raw: AminoProfile) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0
  };
}

function normalizeAminoPost(raw: AminoPost) {
  return {
    platform: "amino",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}