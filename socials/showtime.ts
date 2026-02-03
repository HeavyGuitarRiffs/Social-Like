// lib/socials/showtime.ts

export async function syncShowtime(account: any, supabase: any) {
  const { wallet_address, user_id } = account;

  if (!wallet_address) {
    return { platform: "showtime", updated: false, error: "Missing wallet address" };
  }

  const profile = await fetchShowtimeProfile(wallet_address);
  const posts = await fetchShowtimeNFTs(wallet_address);

  const normalizedProfile = normalizeShowtimeProfile(profile);
  const normalizedPosts = posts.map(normalizeShowtimeNFT);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "showtime",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "showtime", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchShowtimeProfile(wallet: string) {
  return {
    username: "Placeholder Showtime Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchShowtimeNFTs(wallet: string) {
  return [
    {
      id: "1",
      name: "Placeholder Showtime NFT",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeShowtimeProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeShowtimeNFT(raw: any) {
  return {
    platform: "showtime",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}