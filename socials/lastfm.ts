// lib/socials/lastfm.ts

export async function syncLastfm(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "lastfm", updated: false, error: "Missing username" };
  }

  const profile = await fetchLastfmProfile(username);
  const posts = await fetchLastfmRecentTracks(username);

  const normalizedProfile = normalizeLastfmProfile(profile);
  const normalizedPosts = posts.map(normalizeLastfmTrack);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "lastfm",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: 0,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "lastfm", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchLastfmProfile(username: string) {
  return {
    username: "Placeholder Last.fm User",
    avatar_url: "",
  };
}

async function fetchLastfmRecentTracks(username: string) {
  return [
    {
      id: "1",
      track: "Placeholder Track",
      artist: "Placeholder Artist",
      album_art: "",
      playcount: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeLastfmProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
  };
}

function normalizeLastfmTrack(raw: any) {
  return {
    platform: "lastfm",
    post_id: raw.id,
    caption: `${raw.track} — ${raw.artist}`,
    media_url: raw.album_art ?? "",
    likes: raw.playcount ?? 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}