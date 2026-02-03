// lib/socials/peepeth.ts

export async function syncPeepeth(account: any, supabase: any) {
  const { eth_address, user_id } = account;

  if (!eth_address) {
    return { platform: "peepeth", updated: false, error: "Missing Ethereum address" };
  }

  const profile = await fetchPeepethProfile(eth_address);
  const posts = await fetchPeepethPosts(eth_address);

  const normalizedProfile = normalizePeepethProfile(profile);
  const normalizedPosts = posts.map(normalizePeepethPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "peepeth",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "peepeth", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchPeepethProfile(address: string) {
  return {
    username: "Placeholder Peepeth User",
    avatar_url: "",
    followers: 0
  };
}

async function fetchPeepethPosts(address: string) {
  return [
    {
      id: "1",
      text: "Placeholder Peepeth Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizePeepethProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0
  };
}

function normalizePeepethPost(raw: any) {
  return {
    platform: "peepeth",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}