// lib/socials/dailymotion.ts

export async function syncDailymotion(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "dailymotion",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshDailymotionTokenIfNeeded(account, supabase);

  const profile = await fetchDailymotionProfile(refreshed.access_token);
  const posts = await fetchDailymotionVideos(refreshed.access_token);

  const normalizedProfile = normalizeDailymotionProfile(profile);
  const normalizedPosts = posts.map(normalizeDailymotionVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "dailymotion",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "dailymotion",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshDailymotionTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchDailymotionProfile(accessToken: string) {
  return {
    username: "Placeholder DM User",
    avatar_720_url: "",
    fans_total: 0,
  };
}

async function fetchDailymotionVideos(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Dailymotion Video",
      thumbnail_url: "",
      views_total: 0,
      comments_total: 0,
      created_time: new Date().toISOString(),
    },
  ];
}

function normalizeDailymotionProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_720_url ?? "",
    followers: raw.fans_total ?? 0,
  };
}

function normalizeDailymotionVideo(raw: any) {
  return {
    platform: "dailymotion",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.views_total ?? 0,
    comments: raw.comments_total ?? 0,
    posted_at: raw.created_time ?? new Date().toISOString(),
  };
}