// lib/socials/pixelfed.ts

export async function syncPixelfed(account: any, supabase: any) {
  const { access_token, instance_url, user_id } = account;

  if (!access_token || !instance_url) {
    return { platform: "pixelfed", updated: false, error: "Missing access token or instance URL" };
  }

  const profile = await fetchPixelfedProfile(access_token, instance_url);
  const posts = await fetchPixelfedPosts(access_token, instance_url);

  const normalizedProfile = normalizePixelfedProfile(profile);
  const normalizedPosts = posts.map(normalizePixelfedPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "pixelfed",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "pixelfed", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchPixelfedProfile(accessToken: string, instance: string) {
  return {
    username: "Placeholder Pixelfed User",
    avatar: "",
    followers: 0,
    following: 0
  };
}

async function fetchPixelfedPosts(accessToken: string, instance: string) {
  return [
    {
      id: "1",
      caption: "Placeholder Pixelfed Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizePixelfedProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0
  };
}

function normalizePixelfedPost(raw: any) {
  return {
    platform: "pixelfed",
    post_id: raw.id,
    caption: raw.caption ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}