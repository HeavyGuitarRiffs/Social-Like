// lib/socials/soundcloud.ts

export async function syncSoundCloud(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "soundcloud",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshSoundCloudTokenIfNeeded(account, supabase);

  const profile = await fetchSoundCloudProfile(refreshed.access_token);
  const posts = await fetchSoundCloudTracks(refreshed.access_token);

  const normalizedProfile = normalizeSoundCloudProfile(profile);
  const normalizedPosts = posts.map(normalizeSoundCloudTrack);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "soundcloud",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "soundcloud",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshSoundCloudTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchSoundCloudProfile(accessToken: string) {
  return {
    username: "Placeholder Artist",
    avatar_url: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchSoundCloudTracks(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Track",
      artwork_url: "",
      playback_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSoundCloudProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeSoundCloudTrack(raw: any) {
  return {
    platform: "soundcloud",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.artwork_url ?? "",
    likes: raw.playback_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}