// lib/socials/kofi.ts

export async function syncKofi(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "kofi", updated: false, error: "Missing username" };
  }

  const profile = await fetchKofiProfile(username);
  const posts = await fetchKofiPosts(username);

  const normalizedProfile = normalizeKofiProfile(profile);
  const normalizedPosts = posts.map(normalizeKofiPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "kofi",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.supporters,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "kofi", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchKofiProfile(username: string) {
  return {
    username: "Placeholder Ko-fi Creator",
    avatar_url: "",
    supporters: 0
  };
}

async function fetchKofiPosts(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Ko-fi Post",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeKofiProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    supporters: raw.supporters ?? 0
  };
}

function normalizeKofiPost(raw: any) {
  return {
    platform: "kofi",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}