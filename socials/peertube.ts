// lib/socials/peertube.ts

export async function syncPeertube(account: any, supabase: any) {
  const { access_token, user_id, instance_url } = account;

  if (!access_token || !instance_url) {
    return { platform: "peertube", updated: false, error: "Missing access token or instance URL" };
  }

  const refreshed = await refreshPeertubeTokenIfNeeded(account, supabase);

  const profile = await fetchPeertubeProfile(refreshed.access_token, instance_url);
  const posts = await fetchPeertubeVideos(refreshed.access_token, instance_url);

  const normalizedProfile = normalizePeertubeProfile(profile);
  const normalizedPosts = posts.map(normalizePeertubeVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "peertube",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "peertube", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function refreshPeertubeTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchPeertubeProfile(accessToken: string, instance: string) {
  return {
    displayName: "Placeholder Peertube User",
    avatar: "",
    followersCount: 0,
  };
}

async function fetchPeertubeVideos(accessToken: string, instance: string) {
  return [
    {
      id: "1",
      name: "Placeholder Peertube Video",
      thumbnailPath: "",
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    },
  ];
}

function normalizePeertubeProfile(raw: any) {
  return {
    username: raw.displayName ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followersCount ?? 0,
  };
}

function normalizePeertubeVideo(raw: any) {
  return {
    platform: "peertube",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.thumbnailPath ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.createdAt ?? new Date().toISOString(),
  };
}