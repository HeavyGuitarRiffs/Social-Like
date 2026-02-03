import { Account, SyncResult } from "./socialIndex";

export async function syncKuaishou(account: Account, supabase: any): Promise<SyncResult> {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "kuaishou", updated: false, error: "Missing username" };
  }

  // Placeholder fetch functions for now
  const profile = await fetchKuaishouProfile(username);
  const posts = await fetchKuaishouPosts(username);

  const normalizedProfile = normalizeKuaishouProfile(profile);
  const normalizedPosts = posts.map(normalizeKuaishouPost);

  // Upsert profile
  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "kuaishou",
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
    platform: "kuaishou",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Placeholder fetch functions */
async function fetchKuaishouProfile(username: string) {
  return { username, avatar_url: "", followers: 0, following: 0 };
}

async function fetchKuaishouPosts(username: string) {
  return [
    {
      id: "1",
      caption: "Placeholder Kuaishou post",
      media_url: "",
      likes: 0,
      comments: 0,
      posted_at: new Date().toISOString(),
    },
  ];
}

/* Normalizers */
function normalizeKuaishouProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeKuaishouPost(raw: any) {
  return {
    platform: "kuaishou",
    post_id: raw.id,
    caption: raw.caption ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}
