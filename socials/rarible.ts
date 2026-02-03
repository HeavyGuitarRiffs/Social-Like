// lib/socials/rarible.ts

export async function syncRarible(account: any, supabase: any) {
  const { wallet_address, user_id } = account;

  if (!wallet_address) {
    return { platform: "rarible", updated: false, error: "Missing wallet address" };
  }

  const profile = await fetchRaribleProfile(wallet_address);
  const posts = await fetchRaribleItems(wallet_address);

  const normalizedProfile = normalizeRaribleProfile(profile);
  const normalizedPosts = posts.map(normalizeRaribleItem);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "rarible",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "rarible", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchRaribleProfile(wallet: string) {
  return {
    username: "Placeholder Rarible User",
    avatar: "",
    followers: 0,
  };
}

async function fetchRaribleItems(wallet: string) {
  return [
    {
      id: "1",
      name: "Placeholder Rarible NFT",
      image: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeRaribleProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeRaribleItem(raw: any) {
  return {
    platform: "rarible",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}