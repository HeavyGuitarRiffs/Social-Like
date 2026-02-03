// lib/socials/newgrounds.ts

export async function syncNewgrounds(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "newgrounds", updated: false, error: "Missing username" };
  }

  const profile = await fetchNewgroundsProfile(username);
  const posts = await fetchNewgroundsContent(username);

  const normalizedProfile = normalizeNewgroundsProfile(profile);
  const normalizedPosts = posts.map(normalizeNewgroundsPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "newgrounds",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "newgrounds", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchNewgroundsProfile(username: string) {
  return {
    username: "Placeholder Newgrounds Creator",
    avatar_url: "",
    followers: 0
  };
}

async function fetchNewgroundsContent(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Newgrounds Upload",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeNewgroundsProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0
  };
}

function normalizeNewgroundsPost(raw: any) {
  return {
    platform: "newgrounds",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}