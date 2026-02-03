// lib/socials/spotify.ts

export async function syncSpotify(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "spotify",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshSpotifyTokenIfNeeded(account, supabase);

  const profile = await fetchSpotifyProfile(refreshed.access_token);
  const posts = await fetchSpotifyTracks(refreshed.access_token);

  const normalizedProfile = normalizeSpotifyProfile(profile);
  const normalizedPosts = posts.map(normalizeSpotifyTrack);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "spotify",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "spotify",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshSpotifyTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchSpotifyProfile(accessToken: string) {
  return {
    display_name: "placeholder",
    images: [{ url: "" }],
    followers: { total: 0 },
  };
}

async function fetchSpotifyTracks(accessToken: string) {
  return [
    {
      id: "1",
      name: "Placeholder Track",
      album: { images: [{ url: "" }] },
      popularity: 0,
      played_at: new Date().toISOString(),
    },
  ];
}

function normalizeSpotifyProfile(raw: any) {
  return {
    username: raw.display_name ?? "",
    avatar_url: raw.images?.[0]?.url ?? "",
    followers: raw.followers?.total ?? 0,
  };
}

function normalizeSpotifyTrack(raw: any) {
  return {
    platform: "spotify",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.album?.images?.[0]?.url ?? "",
    likes: raw.popularity ?? 0,
    comments: 0,
    posted_at: raw.played_at ?? new Date().toISOString(),
  };
}