// lib/socials/okru.ts

export async function syncOKRu(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "okru",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshOKRuTokenIfNeeded(account, supabase);

  const profile = await fetchOKRuProfile(refreshed.access_token);
  const posts = await fetchOKRuPosts(refreshed.access_token);

  const normalizedProfile = normalizeOKRuProfile(profile);
  const normalizedPosts = posts.map(normalizeOKRuPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "okru",
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
    platform: "okru",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshOKRuTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchOKRuProfile(accessToken: string) {
  return {
    name: "Placeholder OK User",
    pic_full: "",
    followers_count: 0,
    friends_count: 0,
  };
}

async function fetchOKRuPosts(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder OK.ru Post",
      media_url: "",
      like_count: 0,
      comment_count: 0,
      created_ms: Date.now(),
    },
  ];
}

function normalizeOKRuProfile(raw: any) {
  return {
    username: raw.name ?? "",
    avatar_url: raw.pic_full ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.friends_count ?? 0,
  };
}

function normalizeOKRuPost(raw: any) {
  return {
    platform: "okru",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: new Date(raw.created_ms).toISOString(),
  };
}