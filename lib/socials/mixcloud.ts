// lib/socials/mixcloud.ts

export async function syncMixcloud(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "mixcloud", updated: false, error: "Missing access token" };
  }

  const refreshed = await refreshMixcloudTokenIfNeeded(account, supabase);

  const profile = await fetchMixcloudProfile(refreshed.access_token);
  const posts = await fetchMixcloudShows(refreshed.access_token);

  const normalizedProfile = normalizeMixcloudProfile(profile);
  const normalizedPosts = posts.map(normalizeMixcloudShow);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "mixcloud",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "mixcloud", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function refreshMixcloudTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchMixcloudProfile(accessToken: string) {
  return {
    name: "Placeholder Mixcloud DJ",
    pictures: { large: "" },
    follower_count: 0,
  };
}

async function fetchMixcloudShows(accessToken: string) {
  return [
    {
      id: "1",
      name: "Placeholder Mixcloud Show",
      pictures: { large: "" },
      plays: 0,
      comments: 0,
      created_time: new Date().toISOString(),
    },
  ];
}

function normalizeMixcloudProfile(raw: any) {
  return {
    username: raw.name ?? "",
    avatar_url: raw.pictures?.large ?? "",
    followers: raw.follower_count ?? 0,
  };
}

function normalizeMixcloudShow(raw: any) {
  return {
    platform: "mixcloud",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.pictures?.large ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_time ?? new Date().toISOString(),
  };
}