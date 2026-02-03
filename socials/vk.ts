// lib/socials/vk.ts

export async function syncVK(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "vk",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshVKTokenIfNeeded(account, supabase);

  const profile = await fetchVKProfile(refreshed.access_token);
  const posts = await fetchVKPosts(refreshed.access_token);

  const normalizedProfile = normalizeVKProfile(profile);
  const normalizedPosts = posts.map(normalizeVKPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "vk",
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
    platform: "vk",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshVKTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchVKProfile(accessToken: string) {
  return {
    first_name: "Placeholder",
    last_name: "User",
    photo_max: "",
    followers_count: 0,
    friends_count: 0,
  };
}

async function fetchVKPosts(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder VK Post",
      image_url: "",
      likes: { count: 0 },
      comments: { count: 0 },
      date: Date.now(),
    },
  ];
}

function normalizeVKProfile(raw: any) {
  return {
    username: `${raw.first_name ?? ""} ${raw.last_name ?? ""}`.trim(),
    avatar_url: raw.photo_max ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.friends_count ?? 0,
  };
}

function normalizeVKPost(raw: any) {
  return {
    platform: "vk",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes?.count ?? 0,
    comments: raw.comments?.count ?? 0,
    posted_at: new Date(raw.date).toISOString(),
  };
}