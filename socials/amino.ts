// lib/socials/amino.ts

export async function syncAmino(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "amino", updated: false, error: "Missing access token" };
  }

  const profile = await fetchAminoProfile(access_token);
  const posts = await fetchAminoPosts(access_token);

  const normalizedProfile = normalizeAminoProfile(profile);
  const normalizedPosts = posts.map(normalizeAminoPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "amino",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "amino", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchAminoProfile(accessToken: string) {
  return {
    username: "Placeholder Amino User",
    avatar_url: "",
    followers: 0,
    following: 0
  };
}

async function fetchAminoPosts(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Amino Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeAminoProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0
  };
}

function normalizeAminoPost(raw: any) {
  return {
    platform: "amino",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}