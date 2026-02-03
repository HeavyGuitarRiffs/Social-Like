// lib/socials/twitter.ts

export async function syncTwitter(account: any, supabase: any) {
  const { access_token, refresh_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "twitter",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshTwitterTokenIfNeeded(account, supabase);

  const profile = await fetchTwitterProfile(refreshed.access_token);
  const posts = await fetchTwitterPosts(refreshed.access_token);

  const normalizedProfile = normalizeTwitterProfile(profile);
  const normalizedPosts = posts.map(normalizeTwitterPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "twitter",
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
    platform: "twitter",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helper functions */

async function refreshTwitterTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchTwitterProfile(accessToken: string) {
  return {
    username: "placeholder",
    profile_image_url: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchTwitterPosts(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder tweet",
      media_url: "",
      like_count: 0,
      reply_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTwitterProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.profile_image_url ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeTwitterPost(raw: any) {
  return {
    platform: "twitter",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.reply_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}