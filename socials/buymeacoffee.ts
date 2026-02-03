// lib/socials/buymeacoffee.ts

export async function syncBuyMeACoffee(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "buymeacoffee", updated: false, error: "Missing username" };
  }

  const profile = await fetchBuyMeACoffeeProfile(username);
  const posts = await fetchBuyMeACoffeePosts(username);

  const normalizedProfile = normalizeBuyMeACoffeeProfile(profile);
  const normalizedPosts = posts.map(normalizeBuyMeACoffeePost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "buymeacoffee",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.supporters,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "buymeacoffee", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchBuyMeACoffeeProfile(username: string) {
  return {
    username: "Placeholder BMC Creator",
    avatar_url: "",
    supporters: 0
  };
}

async function fetchBuyMeACoffeePosts(username: string) {
  return [
    {
      id: "1",
      title: "Placeholder BMC Post",
      image_url: "",
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeBuyMeACoffeeProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    supporters: raw.supporters ?? 0
  };
}

function normalizeBuyMeACoffeePost(raw: any) {
  return {
    platform: "buymeacoffee",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}