// lib/socials/wattpad.ts

export async function syncWattpad(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "wattpad", updated: false, error: "Missing username" };
  }

  const profile = await fetchWattpadProfile(username);
  const posts = await fetchWattpadStories(username);

  const normalizedProfile = normalizeWattpadProfile(profile);
  const normalizedPosts = posts.map(normalizeWattpadStory);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "wattpad",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "wattpad", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchWattpadProfile(username: string) {
  return {
    username: "Placeholder Wattpad Author",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchWattpadStories(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Wattpad Story",
      cover_url: "",
      reads: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeWattpadProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeWattpadStory(raw: any) {
  return {
    platform: "wattpad",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.cover_url ?? "",
    likes: raw.reads ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}