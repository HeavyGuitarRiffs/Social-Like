// lib/socials/anchor.ts

export async function syncAnchor(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "anchor", updated: false, error: "Missing access token" };
  }

  const profile = await fetchAnchorProfile(access_token);
  const posts = await fetchAnchorEpisodes(access_token);

  const normalizedProfile = normalizeAnchorProfile(profile);
  const normalizedPosts = posts.map(normalizeAnchorEpisode);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "anchor",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "anchor", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchAnchorProfile(accessToken: string) {
  return {
    username: "Placeholder Anchor Podcaster",
    avatar_url: "",
    followers: 0
  };
}

async function fetchAnchorEpisodes(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Podcast Episode",
      audio_url: "",
      plays: 0,
      comments: 0,
      published_at: new Date().toISOString()
    }
  ];
}

function normalizeAnchorProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0
  };
}

function normalizeAnchorEpisode(raw: any) {
  return {
    platform: "anchor",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.audio_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString()
  };
}