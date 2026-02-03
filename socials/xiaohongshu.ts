import { Account, SyncResult } from "./socialIndex";

export async function syncXiaohongshu(account: Account, supabase: any): Promise<SyncResult> {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "xiaohongshu", updated: false, error: "Missing username" };
  }

  // Placeholder fetch functions
  const profile = await fetchRedProfile(username);
  const posts = await fetchRedPosts(username);

  const normalizedProfile = normalizeRedProfile(profile);
  const normalizedPosts = posts.map(normalizeRedPost);

  // Upsert profile into Supabase
  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "xiaohongshu",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  // Upsert posts
  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "xiaohongshu",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Placeholder fetch functions */
async function fetchRedProfile(username: string) {
  return { username, avatar_url: "", followers: 0, following: 0 };
}

async function fetchRedPosts(username: string) {
  return [
    {
      id: "1",
      caption: "Placeholder Xiaohongshu post",
      media_url: "",
      likes: 0,
      comments: 0,
      posted_at: new Date().toISOString(),
    },
  ];
}

/* Normalizers */
function normalizeRedProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeRedPost(raw: any) {
  return {
    platform: "xiaohongshu",
    post_id: raw.id,
    caption: raw.caption ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}
