// lib/socials/medium.ts

export async function syncMedium(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "medium",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshMediumTokenIfNeeded(account, supabase);

  const profile = await fetchMediumProfile(refreshed.access_token);
  const posts = await fetchMediumPosts(refreshed.access_token);

  const normalizedProfile = normalizeMediumProfile(profile);
  const normalizedPosts = posts.map(normalizeMediumPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "medium",
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
    platform: "medium",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshMediumTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchMediumProfile(accessToken: string) {
  return {
    name: "Placeholder Author",
    image_url: "",
    followers: 0,
  };
}

async function fetchMediumPosts(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Medium Article",
      image_url: "",
      clap_count: 0,
      comment_count: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizeMediumProfile(raw: any) {
  return {
    username: raw.name ?? "",
    avatar_url: raw.image_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeMediumPost(raw: any) {
  return {
    platform: "medium",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.clap_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}