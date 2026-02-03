// lib/socials/smugmug.ts

export async function syncSmugMug(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "smugmug", updated: false, error: "Missing access token" };
  }

  const profile = await fetchSmugMugProfile(access_token);
  const posts = await fetchSmugMugPhotos(access_token);

  const normalizedProfile = normalizeSmugMugProfile(profile);
  const normalizedPosts = posts.map(normalizeSmugMugPhoto);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "smugmug",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: 0,
    following: 0,
    last_synced: new Date().toISOString()
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "smugmug", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchSmugMugProfile(accessToken: string) {
  return {
    username: "Placeholder SmugMug Photographer",
    avatar_url: ""
  };
}

async function fetchSmugMugPhotos(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder SmugMug Photo",
      image_url: "",
      views: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
  ];
}

function normalizeSmugMugProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? ""
  };
}

function normalizeSmugMugPhoto(raw: any) {
  return {
    platform: "smugmug",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.views ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString()
  };
}