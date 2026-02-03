// lib/socials/dribbble.ts

export async function syncDribbble(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "dribbble",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshDribbbleTokenIfNeeded(account, supabase);

  const profile = await fetchDribbbleProfile(refreshed.access_token);
  const posts = await fetchDribbbleShots(refreshed.access_token);

  const normalizedProfile = normalizeDribbbleProfile(profile);
  const normalizedPosts = posts.map(normalizeDribbbleShot);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "dribbble",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "dribbble",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshDribbbleTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchDribbbleProfile(accessToken: string) {
  return {
    name: "Placeholder Designer",
    avatar_url: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchDribbbleShots(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Shot",
      images: { normal: "" },
      likes_count: 0,
      comments_count: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizeDribbbleProfile(raw: any) {
  return {
    username: raw.name ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeDribbbleShot(raw: any) {
  return {
    platform: "dribbble",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.images?.normal ?? "",
    likes: raw.likes_count ?? 0,
    comments: raw.comments_count ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}