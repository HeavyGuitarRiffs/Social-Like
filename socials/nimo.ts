// lib/socials/nimotv.ts

export async function syncNimoTV(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "nimotv", updated: false, error: "Missing access token" };
  }

  const profile = await fetchNimoTVProfile(access_token);
  const posts = await fetchNimoTVStreams(access_token);

  const normalizedProfile = normalizeNimoTVProfile(profile);
  const normalizedPosts = posts.map(normalizeNimoTVStream);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "nimotv",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "nimotv", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchNimoTVProfile(accessToken: string) {
  return {
    username: "Placeholder NimoTV Streamer",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchNimoTVStreams(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder NimoTV Stream",
      thumbnail_url: "",
      viewers: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeNimoTVProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeNimoTVStream(raw: any) {
  return {
    platform: "nimotv",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.viewers ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}