// lib/socials/wechat.ts

import type { Account } from "./socialIndex";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export async function syncWeChat(
  account: Account,
  supabase: SupabaseClient<Database>
) {
  const {
    account_id,
    user_id,
    access_token,
  } = account as unknown as {
    account_id: string;
    user_id: string;
    access_token: string;
  };

  if (!access_token) {
    return {
      platform: "wechat",
      updated: false,
      error: "Missing access token",
      account_id,
    };
  }

  const refreshed = await refreshWeChatTokenIfNeeded(
    { access_token, user_id, account_id },
    supabase
  );

  const profile = await fetchWeChatProfile(refreshed.access_token);
  const posts = await fetchWeChatMoments(refreshed.access_token);

  const normalizedProfile = normalizeWeChatProfile(profile);
  const normalizedPosts = posts.map(normalizeWeChatMoment);

  /* ---------------------------------
     social_profiles
  ----------------------------------*/
  await supabase.from("social_profiles").upsert({
    account_id,
    user_id,
    platform: "wechat",
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
    platform: "wechat",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
    account_id,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type RawWeChatProfile = {
  nickname?: string;
  headimgurl?: string;
  followers?: number;
  following?: number;
};

type RawWeChatMoment = {
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

async function refreshWeChatTokenIfNeeded(
  account: { access_token: string; user_id: string; account_id: string },
  supabase: SupabaseClient<Database>
) {
  return account; // placeholder
}

async function fetchWeChatProfile(
  accessToken: string
): Promise<RawWeChatProfile> {
  return {
    nickname: "Placeholder WeChat User",
    headimgurl: "",
    followers: 0,
    following: 0,
  };
}

async function fetchWeChatMoments(
  accessToken: string
): Promise<RawWeChatMoment[]> {
  return [
    {
      id: "1",
      text: "Placeholder WeChat Moment",
      media_url: "",
      like_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeWeChatProfile(raw: RawWeChatProfile): NormalizedProfile {
  return {
    username: raw.nickname ?? "",
    avatar_url: raw.headimgurl ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeWeChatMoment(raw: RawWeChatMoment): NormalizedPost {
  return {
    platform: "wechat",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}