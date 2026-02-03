// lib/socials/truthsocial.ts

export async function syncTruthSocial(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "truthsocial",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshTruthSocialTokenIfNeeded(account, supabase);

  const profile = await fetchTruthSocialProfile(refreshed.access_token);
  const posts = await fetchTruthSocialPosts(refreshed.access_token);

  const normalizedProfile = normalizeTruthSocialProfile(profile);
  const normalizedPosts = posts.map(normalizeTruthSocialPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "truthsocial",
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
    platform: "truthsocial",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshTruthSocialTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchTruthSocialProfile(accessToken: string) {
  return {
    username: "Placeholder Truth User",
    avatar_url: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchTruthSocialPosts(accessToken: string) {
  return [
    {
      id: "1",
      content: "Placeholder Truth Post",
      media_url: "",
      like_count: 0,
      reply_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTruthSocialProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeTruthSocialPost(raw: any) {
  return {
    platform: "truthsocial",
    post_id: raw.id,
    caption: raw.content ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.reply_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}