// lib/socials/superrare.ts

export async function syncSuperRare(account: any, supabase: any) {
  const { wallet_address, user_id } = account;

  if (!wallet_address) {
    return { platform: "superrare", updated: false, error: "Missing wallet address" };
  }

  const profile = await fetchSuperRareProfile(wallet_address);
  const posts = await fetchSuperRareCreations(wallet_address);

  const normalizedProfile = normalizeSuperRareProfile(profile);
  const normalizedPosts = posts.map(normalizeSuperRareCreation);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "superrare",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "superrare", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchSuperRareProfile(wallet: string) {
  return {
    username: "Placeholder SuperRare Artist",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchSuperRareCreations(wallet: string) {
  return [
    {
      id: "1",
      name: "Placeholder SuperRare Artwork",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSuperRareProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeSuperRareCreation(raw: any) {
  return {
    platform: "superrare",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}