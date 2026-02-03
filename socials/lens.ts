// lib/socials/lens.ts

export async function syncLens(account: any, supabase: any) {
  const { wallet_address, user_id } = account;

  if (!wallet_address) {
    return { platform: "lens", updated: false, error: "Missing wallet address" };
  }

  const profile = await fetchLensProfile(wallet_address);
  const posts = await fetchLensPublications(wallet_address);

  const normalizedProfile = normalizeLensProfile(profile);
  const normalizedPosts = posts.map(normalizeLensPublication);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "lens",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "lens", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchLensProfile(wallet: string) {
  return {
    handle: "placeholder.lens",
    avatar: "",
    followers: 0,
    following: 0,
  };
}

async function fetchLensPublications(wallet: string) {
  return [
    {
      id: "1",
      content: "Placeholder Lens Post",
      media_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeLensProfile(raw: any) {
  return {
    username: raw.handle ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeLensPublication(raw: any) {
  return {
    platform: "lens",
    post_id: raw.id,
    caption: raw.content ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}