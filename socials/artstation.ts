// lib/socials/artstation.ts

export async function syncArtStation(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "artstation", updated: false, error: "Missing username" };
  }

  const profile = await fetchArtStationProfile(username);
  const posts = await fetchArtStationProjects(username);

  const normalizedProfile = normalizeArtStationProfile(profile);
  const normalizedPosts = posts.map(normalizeArtStationProject);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "artstation",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "artstation", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchArtStationProfile(username: string) {
  return {
    username: "Placeholder ArtStation Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchArtStationProjects(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder ArtStation Project",
      cover_url: "",
      likes: 0,
      comments: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizeArtStationProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeArtStationProject(raw: any) {
  return {
    platform: "artstation",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.cover_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}