// lib/socials/foundation.ts

export async function syncFoundation(account: any, supabase: any) {
  const { wallet_address, user_id } = account;

  if (!wallet_address) {
    return { platform: "foundation", updated: false, error: "Missing wallet address" };
  }

  const profile = await fetchFoundationProfile(wallet_address);
  const posts = await fetchFoundationCreations(wallet_address);

  const normalizedProfile = normalizeFoundationProfile(profile);
  const normalizedPosts = posts.map(normalizeFoundationCreation);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "foundation",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "foundation", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchFoundationProfile(wallet: string) {
  return {
    username: "Placeholder Foundation Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchFoundationCreations(wallet: string) {
  return [
    {
      id: "1",
      name: "Placeholder Foundation Artwork",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeFoundationProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeFoundationCreation(raw: any) {
  return {
    platform: "foundation",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}