// lib/socials/bigolive.ts

export async function syncBigoLive(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "bigolive", updated: false, error: "Missing access token" };
  }

  const profile = await fetchBigoLiveProfile(access_token);
  const posts = await fetchBigoLiveStreams(access_token);

  const normalizedProfile = normalizeBigoLiveProfile(profile);
  const normalizedPosts = posts.map(normalizeBigoLiveStream);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "bigolive",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "bigolive", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchBigoLiveProfile(accessToken: string) {
  return {
    username: "Placeholder BigoLive Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchBigoLiveStreams(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder BigoLive Stream",
      thumbnail_url: "",
      viewers: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeBigoLiveProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeBigoLiveStream(raw: any) {
  return {
    platform: "bigolive",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.viewers ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}