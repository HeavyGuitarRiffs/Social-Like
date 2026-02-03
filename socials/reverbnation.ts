// lib/socials/reverbnation.ts

export async function syncReverbNation(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "reverbnation", updated: false, error: "Missing username" };
  }

  const profile = await fetchReverbNationProfile(username);
  const posts = await fetchReverbNationSongs(username);

  const normalizedProfile = normalizeReverbNationProfile(profile);
  const normalizedPosts = posts.map(normalizeReverbNationSong);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "reverbnation",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "reverbnation", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchReverbNationProfile(username: string) {
  return {
    username: "Placeholder ReverbNation Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchReverbNationSongs(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder ReverbNation Song",
      image_url: "",
      plays: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeReverbNationProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeReverbNationSong(raw: any) {
  return {
    platform: "reverbnation",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}