// lib/socials/pinterest.ts

export async function syncPinterest(account: any, supabase: any) {
  const { access_token, refresh_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "pinterest",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshPinterestTokenIfNeeded(account, supabase);

  const profile = await fetchPinterestProfile(refreshed.access_token);
  const posts = await fetchPinterestPins(refreshed.access_token);

  const normalizedProfile = normalizePinterestProfile(profile);
  const normalizedPosts = posts.map(normalizePinterestPin);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "pinterest",
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
    platform: "pinterest",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helper functions */

async function refreshPinterestTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchPinterestProfile(accessToken: string) {
  return {
    username: "placeholder",
    profile_image: "",
    follower_count: 0,
    following_count: 0,
  };
}

async function fetchPinterestPins(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Pin",
      image_url: "",
      save_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizePinterestProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.profile_image ?? "",
    followers: raw.follower_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizePinterestPin(raw: any) {
  return {
    platform: "pinterest",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.save_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}