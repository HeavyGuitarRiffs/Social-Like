// lib/socials/deviantart.ts

export async function syncDeviantArt(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "deviantart", updated: false, error: "Missing access token" };
  }

  const profile = await fetchDeviantArtProfile(access_token);
  const posts = await fetchDeviantArtDeviations(access_token);

  const normalizedProfile = normalizeDeviantArtProfile(profile);
  const normalizedPosts = posts.map(normalizeDeviantArtDeviation);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "deviantart",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "deviantart", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchDeviantArtProfile(accessToken: string) {
  return {
    username: "Placeholder DeviantArt User",
    usericon: "",
    watchers: 0,
    watching: 0,
  };
}

async function fetchDeviantArtDeviations(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Deviation",
      preview: { src: "" },
      stats: { favourites: 0, comments: 0 },
      published_time: new Date().toISOString(),
    },
  ];
}

function normalizeDeviantArtProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.usericon ?? "",
    followers: raw.watchers ?? 0,
    following: raw.watching ?? 0,
  };
}

function normalizeDeviantArtDeviation(raw: any) {
  return {
    platform: "deviantart",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.preview?.src ?? "",
    likes: raw.stats?.favourites ?? 0,
    comments: raw.stats?.comments ?? 0,
    posted_at: raw.published_time ?? new Date().toISOString(),
  };
}