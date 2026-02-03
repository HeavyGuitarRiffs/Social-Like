// lib/socials/deso.ts

export async function syncDeSo(account: any, supabase: any) {
  const { public_key, user_id } = account;

  if (!public_key) {
    return { platform: "deso", updated: false, error: "Missing public key" };
  }

  const profile = await fetchDeSoProfile(public_key);
  const posts = await fetchDeSoPosts(public_key);

  const normalizedProfile = normalizeDeSoProfile(profile);
  const normalizedPosts = posts.map(normalizeDeSoPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "deso",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "deso", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchDeSoProfile(pubkey: string) {
  return {
    username: "Placeholder DeSo User",
    avatar_url: "",
    followers: 0,
    following: 0
  };
}

async function fetchDeSoPosts(pubkey: string) {
  return [
    {
      id: "1",
      body: "Placeholder DeSo Post",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeDeSoProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0
  };
}

function normalizeDeSoPost(raw: any) {
  return {
    platform: "deso",
    post_id: raw.id,
    caption: raw.body ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}