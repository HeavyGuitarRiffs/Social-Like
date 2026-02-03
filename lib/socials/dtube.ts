// lib/socials/dtube.ts

export async function syncDTube(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "dtube", updated: false, error: "Missing username" };
  }

  const profile = await fetchDTubeProfile(username);
  const posts = await fetchDTubeVideos(username);

  const normalizedProfile = normalizeDTubeProfile(profile);
  const normalizedPosts = posts.map(normalizeDTubeVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "dtube",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "dtube", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchDTubeProfile(username: string) {
  return {
    username: "Placeholder DTube Creator",
    avatar_url: "",
    followers: 0
  };
}

async function fetchDTubeVideos(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder DTube Video",
      thumbnail_url: "",
      votes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeDTubeProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0
  };
}

function normalizeDTubeVideo(raw: any) {
  return {
    platform: "dtube",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.votes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}