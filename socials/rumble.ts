// lib/socials/rumble.ts

export async function syncRumble(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "rumble",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshRumbleTokenIfNeeded(account, supabase);

  const profile = await fetchRumbleProfile(refreshed.access_token);
  const posts = await fetchRumbleVideos(refreshed.access_token);

  const normalizedProfile = normalizeRumbleProfile(profile);
  const normalizedPosts = posts.map(normalizeRumbleVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "rumble",
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
    platform: "rumble",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshRumbleTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchRumbleProfile(accessToken: string) {
  return {
    username: "Placeholder Rumble Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchRumbleVideos(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Rumble Video",
      thumbnail_url: "",
      views: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeRumbleProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeRumbleVideo(raw: any) {
  return {
    platform: "rumble",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.views ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}