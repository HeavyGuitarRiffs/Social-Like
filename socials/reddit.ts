// lib/socials/reddit.ts

export async function syncReddit(account: any, supabase: any) {
  const { access_token, refresh_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "reddit",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshRedditTokenIfNeeded(account, supabase);

  const profile = await fetchRedditProfile(refreshed.access_token);
  const posts = await fetchRedditPosts(refreshed.access_token);

  const normalizedProfile = normalizeRedditProfile(profile);
  const normalizedPosts = posts.map(normalizeRedditPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "reddit",
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
    platform: "reddit",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helper functions */

async function refreshRedditTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchRedditProfile(accessToken: string) {
  return {
    name: "placeholder",
    icon_img: "",
    total_karma: 0,
    followers: 0,
  };
}

async function fetchRedditPosts(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Reddit Post",
      media_url: "",
      ups: 0,
      num_comments: 0,
      created_utc: Date.now(),
    },
  ];
}

function normalizeRedditProfile(raw: any) {
  return {
    username: raw.name ?? "",
    avatar_url: raw.icon_img ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeRedditPost(raw: any) {
  return {
    platform: "reddit",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.ups ?? 0,
    comments: raw.num_comments ?? 0,
    posted_at: new Date(raw.created_utc).toISOString(),
  };
}