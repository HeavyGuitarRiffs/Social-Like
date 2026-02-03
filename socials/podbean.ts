// lib/socials/podbean.ts

export async function syncPodbean(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "podbean", updated: false, error: "Missing access token" };
  }

  const profile = await fetchPodbeanProfile(access_token);
  const posts = await fetchPodbeanEpisodes(access_token);

  const normalizedProfile = normalizePodbeanProfile(profile);
  const normalizedPosts = posts.map(normalizePodbeanEpisode);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "podbean",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "podbean", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchPodbeanProfile(accessToken: string) {
  return {
    username: "Placeholder Podbean Podcaster",
    avatar_url: "",
    followers: 0
  };
}

async function fetchPodbeanEpisodes(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Podbean Episode",
      audio_url: "",
      plays: 0,
      comments: 0,
      published_at: new Date().toISOString()
    }
  ];
}

function normalizePodbeanProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0
  };
}

function normalizePodbeanEpisode(raw: any) {
  return {
    platform: "podbean",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.audio_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString()
  };
}