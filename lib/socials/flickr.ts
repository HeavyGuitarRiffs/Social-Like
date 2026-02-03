// lib/socials/flickr.ts

export async function syncFlickr(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return { platform: "flickr", updated: false, error: "Missing access token" };
  }

  const profile = await fetchFlickrProfile(access_token);
  const posts = await fetchFlickrPhotos(access_token);

  const normalizedProfile = normalizeFlickrProfile(profile);
  const normalizedPosts = posts.map(normalizeFlickrPhoto);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "flickr",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "flickr", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchFlickrProfile(accessToken: string) {
  return {
    username: "Placeholder Flickr User",
    icon_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchFlickrPhotos(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Flickr Photo",
      url: "",
      views: 0,
      comments: 0,
      posted_at: new Date().toISOString(),
    },
  ];
}

function normalizeFlickrProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.icon_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeFlickrPhoto(raw: any) {
  return {
    platform: "flickr",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.url ?? "",
    likes: raw.views ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}