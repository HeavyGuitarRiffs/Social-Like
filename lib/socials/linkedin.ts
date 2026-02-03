// lib/socials/linkedin.ts

export async function syncLinkedIn(account: any, supabase: any) {
  const { access_token, refresh_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "linkedin",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshLinkedInTokenIfNeeded(account, supabase);

  const profile = await fetchLinkedInProfile(refreshed.access_token);
  const posts = await fetchLinkedInPosts(refreshed.access_token);

  const normalizedProfile = normalizeLinkedInProfile(profile);
  const normalizedPosts = posts.map(normalizeLinkedInPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "linkedin",
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
    platform: "linkedin",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helper functions */

async function refreshLinkedInTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchLinkedInProfile(accessToken: string) {
  return {
    localizedFirstName: "Placeholder",
    localizedLastName: "User",
    profilePicture: "",
    followerCount: 0,
    followingCount: 0,
  };
}

async function fetchLinkedInPosts(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder LinkedIn post",
      media_url: "",
      like_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeLinkedInProfile(raw: any) {
  return {
    username: `${raw.localizedFirstName ?? ""} ${raw.localizedLastName ?? ""}`.trim(),
    avatar_url: raw.profilePicture ?? "",
    followers: raw.followerCount ?? 0,
    following: raw.followingCount ?? 0,
  };
}

function normalizeLinkedInPost(raw: any) {
  return {
    platform: "linkedin",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: raw.like_count ?? 0,
    comments: raw.comment_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}