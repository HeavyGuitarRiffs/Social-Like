// lib/socials/producthunt.ts

export async function syncProductHunt(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "producthunt",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshProductHuntTokenIfNeeded(account, supabase);

  const profile = await fetchProductHuntProfile(refreshed.access_token);
  const posts = await fetchProductHuntPosts(refreshed.access_token);

  const normalizedProfile = normalizeProductHuntProfile(profile);
  const normalizedPosts = posts.map(normalizeProductHuntPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "producthunt",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "producthunt",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshProductHuntTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchProductHuntProfile(accessToken: string) {
  return {
    name: "Placeholder Maker",
    avatar: "",
    followers_count: 0,
  };
}

async function fetchProductHuntPosts(accessToken: string) {
  return [
    {
      id: "1",
      name: "Placeholder Launch",
      thumbnail: { url: "" },
      votes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeProductHuntProfile(raw: any) {
  return {
    username: raw.name ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers_count ?? 0,
  };
}

function normalizeProductHuntPost(raw: any) {
  return {
    platform: "producthunt",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.thumbnail?.url ?? "",
    likes: raw.votes_count ?? 0,
    comments: raw.comments_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}