// lib/socials/hive.ts

export async function syncHive(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "hive", updated: false, error: "Missing username" };
  }

  const profile = await fetchHiveProfile(username);
  const posts = await fetchHivePosts(username);

  const normalizedProfile = normalizeHiveProfile(profile);
  const normalizedPosts = posts.map(normalizeHivePost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "hive",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "hive", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchHiveProfile(username: string) {
  return {
    username: "Placeholder Hive User",
    avatar_url: "",
    followers: 0,
    following: 0
  };
}

async function fetchHivePosts(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Hive Post",
      body: "Placeholder content",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeHiveProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0
  };
}

function normalizeHivePost(raw: any) {
  return {
    platform: "hive",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}