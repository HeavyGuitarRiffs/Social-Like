// lib/socials/opensea.ts

export async function syncOpenSea(account: any, supabase: any) {
  const { access_token, user_id, wallet_address } = account;

  if (!wallet_address) {
    return { platform: "opensea", updated: false, error: "Missing wallet address" };
  }

  const refreshed = await refreshOpenSeaTokenIfNeeded(account, supabase);

  const profile = await fetchOpenSeaProfile(wallet_address);
  const posts = await fetchOpenSeaAssets(wallet_address);

  const normalizedProfile = normalizeOpenSeaProfile(profile);
  const normalizedPosts = posts.map(normalizeOpenSeaAsset);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "opensea",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "opensea", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function refreshOpenSeaTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchOpenSeaProfile(wallet: string) {
  return {
    username: "Placeholder OpenSea User",
    image_url: "",
    followers: 0,
  };
}

async function fetchOpenSeaAssets(wallet: string) {
  return [
    {
      id: "1",
      name: "Placeholder NFT",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeOpenSeaProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.image_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeOpenSeaAsset(raw: any) {
  return {
    platform: "opensea",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}