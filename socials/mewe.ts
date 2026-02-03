// lib/socials/mewe.ts

export async function syncMeWe(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "mewe", updated: false, error: "Missing access token" };
  }

  const profile = await fetchMeWeProfile(access_token);
  const posts = await fetchMeWePosts(access_token);

  const normalizedProfile = normalizeMeWeProfile(profile);
  const normalizedPosts = posts.map(normalizeMeWePost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "mewe",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "mewe", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchMeWeProfile(accessToken: string) {
  return {
    username: "Placeholder MeWe User",
    avatar_url: "",
    followers: 0,
    following: 0
  };
}

async function fetchMeWePosts(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder MeWe Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeMeWeProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0
  };
}

function normalizeMeWePost(raw: any) {
  return {
    platform: "mewe",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}