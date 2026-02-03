// lib/socials/castbox.ts

export async function syncCastbox(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "castbox", updated: false, error: "Missing username" };
  }

  const profile = await fetchCastboxProfile(username);
  const posts = await fetchCastboxEpisodes(username);

  const normalizedProfile = normalizeCastboxProfile(profile);
  const normalizedPosts = posts.map(normalizeCastboxEpisode);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "castbox",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "castbox", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchCastboxProfile(username: string) {
  return {
    username: "Placeholder Castbox Podcaster",
    avatar_url: "",
    followers: 0
  };
}

async function fetchCastboxEpisodes(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Castbox Episode",
      audio_url: "",
      plays: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeCastboxProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0
  };
}

function normalizeCastboxEpisode(raw: any) {
  return {
    platform: "castbox",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.audio_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}