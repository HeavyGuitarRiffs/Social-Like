// lib/socials/snapchat.ts

export async function syncSnapchat(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "snapchat",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshSnapchatTokenIfNeeded(account, supabase);

  const profile = await fetchSnapchatProfile(refreshed.access_token);
  const posts = await fetchSnapchatStories(refreshed.access_token);

  const normalizedProfile = normalizeSnapchatProfile(profile);
  const normalizedPosts = posts.map(normalizeSnapchatStory);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "snapchat",
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
    platform: "snapchat",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshSnapchatTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchSnapchatProfile(accessToken: string) {
  return {
    username: "Placeholder Snap User",
    avatar: "",
    subscriber_count: 0,
  };
}

async function fetchSnapchatStories(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder Story",
      media_url: "",
      view_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSnapchatProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.subscriber_count ?? 0,
  };
}

function normalizeSnapchatStory(raw: any) {
  return {
    platform: "snapchat",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.view_count ?? 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}