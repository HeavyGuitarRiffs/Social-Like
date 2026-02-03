// lib/socials/onlyfans.ts

export async function syncOnlyFans(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "onlyfans",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshOnlyFansTokenIfNeeded(account, supabase);

  const profile = await fetchOnlyFansProfile(refreshed.access_token);
  const posts = await fetchOnlyFansPosts(refreshed.access_token);

  const normalizedProfile = normalizeOnlyFansProfile(profile);
  const normalizedPosts = posts.map(normalizeOnlyFansPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "onlyfans",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.subscribers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "onlyfans",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshOnlyFansTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchOnlyFansProfile(accessToken: string) {
  return {
    username: "Placeholder Creator",
    avatar: "",
    subscriber_count: 0,
  };
}

async function fetchOnlyFansPosts(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder OnlyFans Post",
      media_url: "",
      like_count: 0,
      comment_count: 0,
      posted_at: new Date().toISOString(),
    },
  ];
}

function normalizeOnlyFansProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    subscribers: raw.subscriber_count ?? 0,
  };
}

function normalizeOnlyFansPost(raw: any) {
  return {
    platform: "onlyfans",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}// lib/socials/onlyfans.ts

export async function syncOnlyFans(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "onlyfans",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshOnlyFansTokenIfNeeded(account, supabase);

  const profile = await fetchOnlyFansProfile(refreshed.access_token);
  const posts = await fetchOnlyFansPosts(refreshed.access_token);

  const normalizedProfile = normalizeOnlyFansProfile(profile);
  const normalizedPosts = posts.map(normalizeOnlyFansPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "onlyfans",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.subscribers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "onlyfans",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshOnlyFansTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchOnlyFansProfile(accessToken: string) {
  return {
    username: "Placeholder Creator",
    avatar: "",
    subscriber_count: 0,
  };
}

async function fetchOnlyFansPosts(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder OnlyFans Post",
      media_url: "",
      like_count: 0,
      comment_count: 0,
      posted_at: new Date().toISOString(),
    },
  ];
}

function normalizeOnlyFansProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    subscribers: raw.subscriber_count ?? 0,
  };
}

function normalizeOnlyFansPost(raw: any) {
  return {
    platform: "onlyfans",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}