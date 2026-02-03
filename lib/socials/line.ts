// lib/socials/line.ts

export async function syncLINE(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "line",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshLINETokenIfNeeded(account, supabase);

  const profile = await fetchLINEProfile(refreshed.access_token);
  const posts = await fetchLINETimeline(refreshed.access_token);

  const normalizedProfile = normalizeLINEProfile(profile);
  const normalizedPosts = posts.map(normalizeLINEPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "line",
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
    platform: "line",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshLINETokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchLINEProfile(accessToken: string) {
  return {
    displayName: "Placeholder LINE User",
    pictureUrl: "",
    followers: 0,
    following: 0,
  };
}

async function fetchLINETimeline(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder LINE Post",
      media_url: "",
      like_count: 0,
      comment_count: 0,
      createdTime: new Date().toISOString(),
    },
  ];
}

function normalizeLINEProfile(raw: any) {
  return {
    username: raw.displayName ?? "",
    avatar_url: raw.pictureUrl ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeLINEPost(raw: any) {
  return {
    platform: "line",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.createdTime ?? new Date().toISOString(),
  };
}