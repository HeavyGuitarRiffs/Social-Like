// lib/socials/itchio.ts

export async function syncItchio(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "itchio", updated: false, error: "Missing username" };
  }

  const profile = await fetchItchioProfile(username);
  const posts = await fetchItchioProjects(username);

  const normalizedProfile = normalizeItchioProfile(profile);
  const normalizedPosts = posts.map(normalizeItchioProject);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "itchio",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "itchio", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchItchioProfile(username: string) {
  return {
    username: "Placeholder Itch.io Creator",
    avatar_url: "",
    followers: 0
  };
}

async function fetchItchioProjects(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Itch.io Game",
      cover_url: "",
      downloads: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeItchioProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0
  };
}

function normalizeItchioProject(raw: any) {
  return {
    platform: "itchio",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.cover_url ?? "",
    likes: raw.downloads ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}