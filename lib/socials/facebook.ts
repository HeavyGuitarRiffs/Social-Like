// lib/socials/youtube.ts

export async function syncYouTube(account: any, supabase: any) {
  const { access_token, refresh_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "youtube",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshYouTubeTokenIfNeeded(account, supabase);

  const profile = await fetchYouTubeProfile(refreshed.access_token);
  const posts = await fetchYouTubeVideos(refreshed.access_token);

  const normalizedProfile = normalizeYouTubeProfile(profile);
  const normalizedPosts = posts.map(normalizeYouTubeVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "youtube",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.subscribers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "youtube",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helper functions */

async function refreshYouTubeTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchYouTubeProfile(accessToken: string) {
  return {
    title: "Placeholder Channel",
    thumbnail: "",
    subscriberCount: 0,
  };
}

async function fetchYouTubeVideos(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Video",
      thumbnail: "",
      likeCount: 0,
      commentCount: 0,
      publishedAt: new Date().toISOString(),
    },
  ];
}

function normalizeYouTubeProfile(raw: any) {
  return {
    username: raw.title ?? "",
    avatar_url: raw.thumbnail ?? "",
    subscribers: raw.subscriberCount ?? 0,
  };
}

function normalizeYouTubeVideo(raw: any) {
  return {
    platform: "youtube",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail ?? "",
    likes: raw.likeCount ?? 0,
    comments: raw.commentCount ?? 0,
    posted_at: raw.publishedAt ?? new Date().toISOString(),
  };
}