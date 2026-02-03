// lib/socials/threads.ts

export async function syncThreads(account: any, supabase: any) {
  const { access_token, refresh_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "threads",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshThreadsTokenIfNeeded(account, supabase);

  const profile = await fetchThreadsProfile(refreshed.access_token);
  const posts = await fetchThreadsPosts(refreshed.access_token);

  const normalizedProfile = normalizeThreadsProfile(profile);
  const normalizedPosts = posts.map(normalizeThreadsPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "threads",
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
    platform: "threads",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helper functions */

async function refreshThreadsTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchThreadsProfile(accessToken: string) {
  return {
    username: "placeholder",
    profile_picture: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchThreadsPosts(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder Threads post",
      media_url: "",
      like_count: 0,
      reply_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeThreadsProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.profile_picture ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeThreadsPost(raw: any) {
  return {
    platform: "threads",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.reply_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}