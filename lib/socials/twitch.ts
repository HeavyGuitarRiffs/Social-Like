// lib/socials/twitch.ts

export async function syncTwitch(account: any, supabase: any) {
  const { access_token, refresh_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "twitch",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshTwitchTokenIfNeeded(account, supabase);

  const profile = await fetchTwitchProfile(refreshed.access_token);
  const posts = await fetchTwitchVideos(refreshed.access_token);

  const normalizedProfile = normalizeTwitchProfile(profile);
  const normalizedPosts = posts.map(normalizeTwitchVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "twitch",
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
    platform: "twitch",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helper functions */

async function refreshTwitchTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchTwitchProfile(accessToken: string) {
  return {
    display_name: "placeholder",
    profile_image_url: "",
    follower_count: 0,
  };
}

async function fetchTwitchVideos(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Twitch VOD",
      thumbnail_url: "",
      view_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTwitchProfile(raw: any) {
  return {
    username: raw.display_name ?? "",
    avatar_url: raw.profile_image_url ?? "",
    followers: raw.follower_count ?? 0,
  };
}

function normalizeTwitchVideo(raw: any) {
  return {
    platform: "twitch",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.view_count ?? 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}