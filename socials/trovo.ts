// lib/socials/trovo.ts

export async function syncTrovo(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "trovo", updated: false, error: "Missing access token" };
  }

  const profile = await fetchTrovoProfile(access_token);
  const posts = await fetchTrovoStreams(access_token);

  const normalizedProfile = normalizeTrovoProfile(profile);
  const normalizedPosts = posts.map(normalizeTrovoStream);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "trovo",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "trovo", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchTrovoProfile(accessToken: string) {
  return {
    username: "Placeholder Trovo Streamer",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchTrovoStreams(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Trovo Stream",
      thumbnail_url: "",
      viewers: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTrovoProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeTrovoStream(raw: any) {
  return {
    platform: "trovo",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.viewers ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}