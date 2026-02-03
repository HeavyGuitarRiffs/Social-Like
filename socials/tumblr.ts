// lib/socials/tumblr.ts

export async function syncTumblr(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "tumblr",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshTumblrTokenIfNeeded(account, supabase);

  const profile = await fetchTumblrProfile(refreshed.access_token);
  const posts = await fetchTumblrPosts(refreshed.access_token);

  const normalizedProfile = normalizeTumblrProfile(profile);
  const normalizedPosts = posts.map(normalizeTumblrPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "tumblr",
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
    platform: "tumblr",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshTumblrTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchTumblrProfile(accessToken: string) {
  return {
    name: "Placeholder Tumblr User",
    avatar: "",
    followers: 0,
    following: 0,
  };
}

async function fetchTumblrPosts(accessToken: string) {
  return [
    {
      id: "1",
      summary: "Placeholder Tumblr Post",
      media_url: "",
      note_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTumblrProfile(raw: any) {
  return {
    username: raw.name ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeTumblrPost(raw: any) {
  return {
    platform: "tumblr",
    post_id: raw.id,
    caption: raw.summary ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.note_count ?? 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}