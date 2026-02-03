// lib/socials/behance.ts

export async function syncBehance(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "behance",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshBehanceTokenIfNeeded(account, supabase);

  const profile = await fetchBehanceProfile(refreshed.access_token);
  const posts = await fetchBehanceProjects(refreshed.access_token);

  const normalizedProfile = normalizeBehanceProfile(profile);
  const normalizedPosts = posts.map(normalizeBehanceProject);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "behance",
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
    platform: "behance",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshBehanceTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchBehanceProfile(accessToken: string) {
  return {
    display_name: "Placeholder Artist",
    images: { 138: "" },
    stats: { followers: 0 },
  };
}

async function fetchBehanceProjects(accessToken: string) {
  return [
    {
      id: "1",
      name: "Placeholder Project",
      covers: { original: "" },
      stats: { appreciations: 0, comments: 0 },
      published_on: Date.now(),
    },
  ];
}

function normalizeBehanceProfile(raw: any) {
  return {
    username: raw.display_name ?? "",
    avatar_url: raw.images?.[138] ?? "",
    followers: raw.stats?.followers ?? 0,
  };
}

function normalizeBehanceProject(raw: any) {
  return {
    platform: "behance",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.covers?.original ?? "",
    likes: raw.stats?.appreciations ?? 0,
    comments: raw.stats?.comments ?? 0,
    posted_at: new Date(raw.published_on).toISOString(),
  };
}