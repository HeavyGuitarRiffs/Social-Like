// lib/socials/vero.ts

export async function syncVero(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "vero", updated: false, error: "Missing access token" };
  }

  const profile = await fetchVeroProfile(access_token);
  const posts = await fetchVeroPosts(access_token);

  const normalizedProfile = normalizeVeroProfile(profile);
  const normalizedPosts = posts.map(normalizeVeroPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "vero",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "vero", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchVeroProfile(accessToken: string) {
  return {
    username: "Placeholder Vero User",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchVeroPosts(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder Vero Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeVeroProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeVeroPost(raw: any) {
  return {
    platform: "vero",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}