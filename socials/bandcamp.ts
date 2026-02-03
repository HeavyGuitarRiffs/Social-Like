// lib/socials/bandcamp.ts

export async function syncBandcamp(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "bandcamp", updated: false, error: "Missing username" };
  }

  const profile = await fetchBandcampProfile(username);
  const posts = await fetchBandcampReleases(username);

  const normalizedProfile = normalizeBandcampProfile(profile);
  const normalizedPosts = posts.map(normalizeBandcampRelease);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "bandcamp",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "bandcamp", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchBandcampProfile(username: string) {
  return {
    username: "Placeholder Bandcamp Artist",
    image_url: "",
    followers: 0,
  };
}

async function fetchBandcampReleases(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Bandcamp Release",
      image_url: "",
      plays: 0,
      comments: 0,
      released_at: new Date().toISOString(),
    },
  ];
}

function normalizeBandcampProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.image_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeBandcampRelease(raw: any) {
  return {
    platform: "bandcamp",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.plays ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.released_at ?? new Date().toISOString(),
  };
}