// lib/socials/zora.ts

export async function syncZora(account: any, supabase: any) {
  const { wallet_address, user_id } = account;

  if (!wallet_address) {
    return { platform: "zora", updated: false, error: "Missing wallet address" };
  }

  const profile = await fetchZoraProfile(wallet_address);
  const posts = await fetchZoraMints(wallet_address);

  const normalizedProfile = normalizeZoraProfile(profile);
  const normalizedPosts = posts.map(normalizeZoraMint);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "zora",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "zora", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchZoraProfile(wallet: string) {
  return {
    username: "Placeholder Zora Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchZoraMints(wallet: string) {
  return [
    {
      id: "1",
      name: "Placeholder Zora Mint",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeZoraProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeZoraMint(raw: any) {
  return {
    platform: "zora",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}