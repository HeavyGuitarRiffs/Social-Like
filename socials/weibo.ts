// lib/socials/weibo.ts

export async function syncWeibo(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "weibo",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshWeiboTokenIfNeeded(account, supabase);

  const profile = await fetchWeiboProfile(refreshed.access_token);
  const posts = await fetchWeiboPosts(refreshed.access_token);

  const normalizedProfile = normalizeWeiboProfile(profile);
  const normalizedPosts = posts.map(normalizeWeiboPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "weibo",
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
    platform: "weibo",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshWeiboTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchWeiboProfile(accessToken: string) {
  return {
    screen_name: "Placeholder Weibo User",
    avatar_hd: "",
    followers_count: 0,
    friends_count: 0,
  };
}

async function fetchWeiboPosts(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder Weibo Post",
      pic_url: "",
      attitudes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeWeiboProfile(raw: any) {
  return {
    username: raw.screen_name ?? "",
    avatar_url: raw.avatar_hd ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.friends_count ?? 0,
  };
}

function normalizeWeiboPost(raw: any) {
  return {
    platform: "weibo",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.pic_url ?? "",
    likes: raw.attitudes_count ?? 0,
    comments: raw.comments_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}