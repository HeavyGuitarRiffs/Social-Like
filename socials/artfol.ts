// lib/socials/artfol.ts

export async function syncArtfol(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "artfol", updated: false, error: "Missing username" };
  }

  const profile = await fetchArtfolProfile(username);
  const posts = await fetchArtfolPosts(username);

  const normalizedProfile = normalizeArtfolProfile(profile);
  const normalizedPosts = posts.map(normalizeArtfolPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "artfol",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "artfol", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchArtfolProfile(username: string) {
  return {
    username: "Placeholder Artfol Artist",
    avatar_url: "",
    followers: 0,
    following: 0
  };
}

async function fetchArtfolPosts(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Artfol Post",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeArtfolProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0
  };
}

function normalizeArtfolPost(raw: any) {
  return {
    platform: "artfol",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}