// lib/socials/instagram.ts

export async function syncInstagram(account: any, supabase: any) {
  const { id, access_token, refresh_token, user_id } = account;

  // 1. Validate account
  if (!access_token) {
    return {
      platform: "instagram",
      updated: false,
      error: "Missing access token",
    };
  }

  // 2. Refresh token if needed
  const refreshed = await refreshInstagramTokenIfNeeded(account, supabase);

  // 3. Fetch profile data
  const profile = await fetchInstagramProfile(refreshed.access_token);

  // 4. Fetch latest posts
  const posts = await fetchInstagramPosts(refreshed.access_token);

  // 5. Normalize data
  const normalizedProfile = normalizeInstagramProfile(profile);
  const normalizedPosts = posts.map(normalizeInstagramPost);

  // 6. Write to Supabase
  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "instagram",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  // 7. Return sync summary
  return {
    platform: "instagram",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -------------------------------------------------------
   Helper Functions (Stubbed but Real)
   These MUST exist so TypeScript stops complaining.
   You will fill in API logic later.
-------------------------------------------------------- */

async function refreshInstagramTokenIfNeeded(account: any, supabase: any) {
  // TODO: implement refresh logic
  // For now, return the account unchanged
  return account;
}

async function fetchInstagramProfile(accessToken: string) {
  // TODO: call Instagram Graph API
  return {
    username: "placeholder",
    profile_picture: "",
    followers_count: 0,
    follows_count: 0,
  };
}

async function fetchInstagramPosts(accessToken: string) {
  // TODO: call Instagram Graph API
  return [
    {
      id: "1",
      caption: "Placeholder post",
      media_url: "",
      like_count: 0,
      comments_count: 0,
      timestamp: new Date().toISOString(),
    },
  ];
}

function normalizeInstagramProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.profile_picture ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.follows_count ?? 0,
  };
}

function normalizeInstagramPost(raw: any) {
  return {
    platform: "instagram",
    post_id: raw.id,
    caption: raw.caption ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comments_count ?? 0,
    posted_at: raw.timestamp ?? new Date().toISOString(),
  };
}