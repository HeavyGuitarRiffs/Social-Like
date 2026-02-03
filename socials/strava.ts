// lib/socials/strava.ts

export async function syncStrava(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "strava",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshStravaTokenIfNeeded(account, supabase);

  const profile = await fetchStravaProfile(refreshed.access_token);
  const posts = await fetchStravaActivities(refreshed.access_token);

  const normalizedProfile = normalizeStravaProfile(profile);
  const normalizedPosts = posts.map(normalizeStravaActivity);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "strava",
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
    platform: "strava",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshStravaTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchStravaProfile(accessToken: string) {
  return {
    username: "Placeholder Athlete",
    profile: "",
    follower_count: 0,
    friend_count: 0,
  };
}

async function fetchStravaActivities(accessToken: string) {
  return [
    {
      id: "1",
      name: "Placeholder Run",
      distance: 5000,
      moving_time: 1500,
      start_date: new Date().toISOString(),
    },
  ];
}

function normalizeStravaProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.profile ?? "",
    followers: raw.follower_count ?? 0,
    following: raw.friend_count ?? 0,
  };
}

function normalizeStravaActivity(raw: any) {
  return {
    platform: "strava",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: "",
    likes: 0,
    comments: 0,
    posted_at: raw.start_date ?? new Date().toISOString(),
  };
}