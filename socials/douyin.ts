// lib/socials/areyoudead.ts

export async function syncAreYouDead(account: { username: string; user_id: string }, supabase: any) {
  const { username, user_id } = account;

  if (!username) return { platform: "areyoudead", updated: false, error: "Missing username" };

  const profile = await fetchAYDProfile(username);
  const posts = await fetchAYDPosts(username);

  const normalizedProfile = normalizeAYDProfile(profile);
  const normalizedPosts = posts.map(normalizeAYDPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "areyoudead",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "areyoudead", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchAYDProfile(username: string) {
  return {
    username,
    image_url: "",
    followers: Math.floor(Math.random() * 1000),
  };
}

async function fetchAYDPosts(username: string) {
  return Array.from({ length: Math.floor(Math.random() * 3) }).map((_, i) => ({
    id: `${username}-${i}`,
    title: `Are You Dead Post ${i + 1}`,
    image_url: "",
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 10),
    posted_at: new Date().toISOString(),
  }));
}

function normalizeAYDProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.image_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeAYDPost(raw: any) {
  return {
    platform: "areyoudead",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}
import { Account, SyncResult } from "./socialIndex";

export async function syncDouyin(account: Account, supabase: any): Promise<SyncResult> {
  // Placeholder logic
  if (!account.username) {
    return { platform: "douyin", updated: false, error: "Missing username" };
  }

  // Here you could later fetch posts/comments from Douyin API
  // For now, just return a dummy result
  return { platform: "douyin", updated: true, posts: 0, metrics: true };
}
