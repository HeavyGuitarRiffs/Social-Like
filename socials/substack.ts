// lib/socials/substack.ts

export async function syncSubstack(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "substack",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshSubstackTokenIfNeeded(account, supabase);

  const profile = await fetchSubstackProfile(refreshed.access_token);
  const posts = await fetchSubstackPosts(refreshed.access_token);

  const normalizedProfile = normalizeSubstackProfile(profile);
  const normalizedPosts = posts.map(normalizeSubstackPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "substack",
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
    platform: "substack",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshSubstackTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchSubstackProfile(accessToken: string) {
  return {
    name: "Placeholder Writer",
    profile_image: "",
    subscriber_count: 0,
  };
}

async function fetchSubstackPosts(accessToken: string) {
  return [
    {
      id: "1",
      title: "Placeholder Substack Post",
      body: "",
      like_count: 0,
      comment_count: 0,
      published_at: new Date().toISOString(),
    },
  ];
}

function normalizeSubstackProfile(raw: any) {
  return {
    username: raw.name ?? "",
    avatar_url: raw.profile_image ?? "",
    subscribers: raw.subscriber_count ?? 0,
  };
}

function normalizeSubstackPost(raw: any) {
  return {
    platform: "substack",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.published_at ?? new Date().toISOString(),
  };
}