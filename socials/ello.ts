// lib/socials/ello.ts

export async function syncEllo(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "ello", updated: false, error: "Missing username" };
  }

  const profile = await fetchElloProfile(username);
  const posts = await fetchElloPosts(username);

  const normalizedProfile = normalizeElloProfile(profile);
  const normalizedPosts = posts.map(normalizeElloPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "ello",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "ello", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchElloProfile(username: string) {
  return {
    username: "Placeholder Ello Artist",
    avatar_url: "",
    followers: 0
  };
}

async function fetchElloPosts(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Ello Post",
      image_url: "",
      loves: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeElloProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0
  };
}

function normalizeElloPost(raw: any) {
  return {
    platform: "ello",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.loves ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}