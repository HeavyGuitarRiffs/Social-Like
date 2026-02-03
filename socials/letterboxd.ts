// lib/socials/letterboxd.ts

export async function syncLetterboxd(account: any, supabase: any) {
  const { username, user_id } = account;

  if (!username) {
    return { platform: "letterboxd", updated: false, error: "Missing username" };
  }

  const profile = await fetchLetterboxdProfile(username);
  const posts = await fetchLetterboxdReviews(username);

  const normalizedProfile = normalizeLetterboxdProfile(profile);
  const normalizedPosts = posts.map(normalizeLetterboxdReview);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "letterboxd",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return { platform: "letterboxd", updated: true, posts: normalizedPosts.length, metrics: true };
}

/* Helpers */

async function fetchLetterboxdProfile(username: string) {
  return {
    username: "Placeholder Letterboxd User",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchLetterboxdReviews(username: string) {
  return [
    {
      id: "1",
      film: "Placeholder Film",
      review: "Placeholder review",
      rating: 4,
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeLetterboxdProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeLetterboxdReview(raw: any) {
  return {
    platform: "letterboxd",
    post_id: raw.id,
    caption: `${raw.film ?? ""}: ${raw.review ?? ""}`,
    media_url: "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}