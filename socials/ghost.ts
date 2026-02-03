// lib/socials/ghost.ts

export async function syncGhost(account: any, supabase: any) {
  const { api_key, site_url, user_id } = account;

  if (!api_key || !site_url) {
    return { platform: "ghost", updated: false, error: "Missing API key or site URL" };
  }

  const profile = await fetchGhostProfile(api_key, site_url);
  const posts = await fetchGhostPosts(api_key, site_url);

  const normalizedProfile = normalizeGhostProfile(profile);
  const normalizedPosts = posts.map(normalizeGhostPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "ghost",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: 0,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "ghost", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchGhostProfile(apiKey: string, site: string) {
  return {
    username: "Placeholder Ghost Author",
    avatar_url: ""
  };
}

async function fetchGhostPosts(apiKey: string, site: string) {
  return [
    {
      id: "1",
      title: "Placeholder Ghost Post",
      feature_image: "",
      likes: 0,
      comments: 0,
      published_at: new Date().toISOString()
    }
  ];
}

function normalizeGhostProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? ""
  };
}

function normalizeGhostPost(raw: any) {
  return {
    platform: "ghost",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.feature_image ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString()
  };
}