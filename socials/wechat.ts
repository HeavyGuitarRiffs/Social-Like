// lib/socials/wechat.ts

export async function syncWeChat(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "wechat",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshWeChatTokenIfNeeded(account, supabase);

  const profile = await fetchWeChatProfile(refreshed.access_token);
  const posts = await fetchWeChatMoments(refreshed.access_token);

  const normalizedProfile = normalizeWeChatProfile(profile);
  const normalizedPosts = posts.map(normalizeWeChatMoment);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "wechat",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "wechat",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshWeChatTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchWeChatProfile(accessToken: string) {
  return {
    nickname: "Placeholder WeChat User",
    headimgurl: "",
    followers: 0,
    following: 0,
  };
}

async function fetchWeChatMoments(accessToken: string) {
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

function normalizeWeChatProfile(raw: any) {
  return {
    username: raw.nickname ?? "",
    avatar_url: raw.headimgurl ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeWeChatMoment(raw: any) {
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