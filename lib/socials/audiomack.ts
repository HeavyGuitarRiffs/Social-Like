// lib/socials/audiomack.ts

export async function syncAudiomack(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "audiomack", updated: false, error: "Missing username" };
  }

  const profile = await fetchAudiomackProfile(username);
  const posts = await fetchAudiomackUploads(username);

  const normalizedProfile = normalizeAudiomackProfile(profile);
  const normalizedPosts = posts.map(normalizeAudiomackUpload);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "audiomack",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "audiomack", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchAudiomackProfile(username: string) {
  return {
    username: "Placeholder Audiomack Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchAudiomackUploads(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Audiomack Upload",
      image_url: "",
      plays: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeAudiomackProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeAudiomackUpload(raw: any) {
  return {
    platform: "audiomack",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}