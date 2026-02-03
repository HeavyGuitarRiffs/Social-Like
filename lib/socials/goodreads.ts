// lib/socials/goodreads.ts

export async function syncGoodreads(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "goodreads", updated: false, error: "Missing username" };
  }

  const profile = await fetchGoodreadsProfile(username);
  const posts = await fetchGoodreadsReviews(username);

  const normalizedProfile = normalizeGoodreadsProfile(profile);
  const normalizedPosts = posts.map(normalizeGoodreadsReview);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "goodreads",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "goodreads", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchGoodreadsProfile(username: string) {
  return {
    username: "Placeholder Goodreads User",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchGoodreadsReviews(username: string) {
  return [
    {
      id: "1",
      book: "Placeholder Book",
      review: "Placeholder review",
      rating: 5,
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeGoodreadsProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeGoodreadsReview(raw: any) {
  return {
    platform: "goodreads",
    post_id: raw.id,
    caption: `${raw.book ?? ""}: ${raw.review ?? ""}`,
    media_url: "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}