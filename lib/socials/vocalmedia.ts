// lib/socials/vocalmedia.ts

export async function syncVocalMedia(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "vocalmedia", updated: false, error: "Missing username" };
  }

  const profile = await fetchVocalMediaProfile(username);
  const posts = await fetchVocalMediaStories(username);

  const normalizedProfile = normalizeVocalMediaProfile(profile);
  const normalizedPosts = posts.map(normalizeVocalMediaStory);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "vocalmedia",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "vocalmedia", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchVocalMediaProfile(username: string) {
  return {
    username: "Placeholder Vocal Writer",
    avatar_url: "",
    followers: 0
  };
}

async function fetchVocalMediaStories(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder Vocal Story",
      image_url: "",
      reads: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeVocalMediaProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0
  };
}

function normalizeVocalMediaStory(raw: any) {
  return {
    platform: "vocalmedia",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.reads ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}