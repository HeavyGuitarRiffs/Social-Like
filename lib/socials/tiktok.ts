// lib/socials/tiktok.ts

export async function syncTikTok(account: any, supabase: any) {
  const { access_token, refresh_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "tiktok",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshTikTokTokenIfNeeded(account, supabase);

  const profile = await fetchTikTokProfile(refreshed.access_token);
  const posts = await fetchTikTokPosts(refreshed.access_token);

  const normalizedProfile = normalizeTikTokProfile(profile);
  const normalizedPosts = posts.map(normalizeTikTokPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "tiktok",
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
    platform: "tiktok",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helper functions */

async function refreshTikTokTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchTikTokProfile(accessToken: string) {
  return {
    username: "placeholder",
    avatar_url: "",
    follower_count: 0,
    following_count: 0,
  };
}

async function fetchTikTokPosts(accessToken: string) {
  return [
    {
      id: "1",
      description: "Placeholder TikTok",
      video_url: "",
      like_count: 0,
      comment_count: 0,
      create_time: new Date().toISOString(),
    },
  ];
}

function normalizeTikTokProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.follower_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeTikTokPost(raw: any) {
  return {
    platform: "tiktok",
    post_id: raw.id,
    caption: raw.description ?? "",
    media_url: raw.video_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.create_time ?? new Date().toISOString(),
  };
}