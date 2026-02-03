// lib/socials/patreon.ts

export async function syncPatreon(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "patreon",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshPatreonTokenIfNeeded(account, supabase);

  const profile = await fetchPatreonProfile(refreshed.access_token);
  const posts = await fetchPatreonPosts(refreshed.access_token);

  const normalizedProfile = normalizePatreonProfile(profile);
  const normalizedPosts = posts.map(normalizePatreonPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "patreon",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.patrons,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "patreon",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshPatreonTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchPatreonProfile(accessToken: string) {
  return {
    full_name: "Placeholder Creator",
    image_url: "",
    patron_count: 0,
  };
}

async function fetchPatreonPosts(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Patreon Post",
      content: "",
      like_count: 0,
      comment_count: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizePatreonProfile(raw: any) {
  return {
    username: raw.full_name ?? "",
    avatar_url: raw.image_url ?? "",
    patrons: raw.patron_count ?? 0,
  };
}

function normalizePatreonPost(raw: any) {
  return {
    platform: "patreon",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}