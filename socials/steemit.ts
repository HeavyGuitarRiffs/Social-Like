// lib/socials/steemit.ts

export async function syncSteemit(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "steemit", updated: false, error: "Missing username" };
  }

  const profile = await fetchSteemitProfile(username);
  const posts = await fetchSteemitPosts(username);

  const normalizedProfile = normalizeSteemitProfile(profile);
  const normalizedPosts = posts.map(normalizeSteemitPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "steemit",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "steemit", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchSteemitProfile(username: string) {
  return {
    username: "Placeholder Steemit User",
    avatar_url: "",
    followers: 0,
    following: 0
  };
}

async function fetchSteemitPosts(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Steemit Post",
      body: "Placeholder content",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeSteemitProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0
  };
}

function normalizeSteemitPost(raw: any) {
  return {
    platform: "steemit",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}