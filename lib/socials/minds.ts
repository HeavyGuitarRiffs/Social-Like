// lib/socials/minds.ts

export async function syncMinds(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "minds", updated: false, error: "Missing access token" };
  }

  const profile = await fetchMindsProfile(access_token);
  const posts = await fetchMindsPosts(access_token);

  const normalizedProfile = normalizeMindsProfile(profile);
  const normalizedPosts = posts.map(normalizeMindsPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "minds",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "minds", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchMindsProfile(accessToken: string) {
  return {
    username: "Placeholder Minds User",
    avatar_url: "",
    followers: 0,
    following: 0
  };
}

async function fetchMindsPosts(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Minds Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeMindsProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0
  };
}

function normalizeMindsPost(raw: any) {
  return {
    platform: "minds",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}