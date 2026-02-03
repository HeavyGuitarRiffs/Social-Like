// lib/socials/kick.ts

export async function syncKick(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "kick",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshKickTokenIfNeeded(account, supabase);

  const profile = await fetchKickProfile(refreshed.access_token);
  const posts = await fetchKickStreams(refreshed.access_token);

  const normalizedProfile = normalizeKickProfile(profile);
  const normalizedPosts = posts.map(normalizeKickStream);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "kick",
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
    platform: "kick",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshKickTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchKickProfile(accessToken: string) {
  return {
    username: "Placeholder Streamer",
    avatar: "",
    follower_count: 0,
  };
}

async function fetchKickStreams(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Kick Stream",
      thumbnail_url: "",
      viewer_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeKickProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.follower_count ?? 0,
  };
}

function normalizeKickStream(raw: any) {
  return {
    platform: "kick",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.viewer_count ?? 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}