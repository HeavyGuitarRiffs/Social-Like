// lib/socials/bilibili.ts

export async function syncBilibili(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "bilibili",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshBilibiliTokenIfNeeded(account, supabase);

  const profile = await fetchBilibiliProfile(refreshed.access_token);
  const posts = await fetchBilibiliVideos(refreshed.access_token);

  const normalizedProfile = normalizeBilibiliProfile(profile);
  const normalizedPosts = posts.map(normalizeBilibiliVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "bilibili",
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
    platform: "bilibili",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshBilibiliTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchBilibiliProfile(accessToken: string) {
  return {
    name: "Placeholder Bilibili User",
    face: "",
    follower: 0,
    following: 0,
  };
}

async function fetchBilibiliVideos(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Bilibili Video",
      pic: "",
      like: 0,
      reply: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeBilibiliProfile(raw: any) {
  return {
    username: raw.name ?? "",
    avatar_url: raw.face ?? "",
    followers: raw.follower ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeBilibiliVideo(raw: any) {
  return {
    platform: "bilibili",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.pic ?? "",
    likes: raw.like ?? 0,
    comments: raw.reply ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}