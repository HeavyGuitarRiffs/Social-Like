// lib/socials/soundclick.ts

export async function syncSoundClick(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "soundclick", updated: false, error: "Missing username" };
  }

  const profile = await fetchSoundClickProfile(username);
  const posts = await fetchSoundClickSongs(username);

  const normalizedProfile = normalizeSoundClickProfile(profile);
  const normalizedPosts = posts.map(normalizeSoundClickSong);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "soundclick",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "soundclick", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchSoundClickProfile(username: string) {
  return {
    username: "Placeholder SoundClick Artist",
    avatar_url: "",
    followers: 0
  };
}

async function fetchSoundClickSongs(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder SoundClick Song",
      image_url: "",
      plays: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeSoundClickProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0
  };
}

function normalizeSoundClickSong(raw: any) {
  return {
    platform: "soundclick",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}