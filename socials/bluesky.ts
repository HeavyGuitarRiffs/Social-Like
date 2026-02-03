// lib/socials/bluesky.ts

export async function syncBluesky(account: any, supabase: any) {
  const { access_token, user_id, did } = account;

  if (!access_token || !did) {
    return {
      platform: "bluesky",
      updated: false,
      error: "Missing access token or DID",
    };
  }

  const refreshed = await refreshBlueskyTokenIfNeeded(account, supabase);

  const profile = await fetchBlueskyProfile(refreshed.access_token, did);
  const posts = await fetchBlueskyPosts(refreshed.access_token, did);

  const normalizedProfile = normalizeBlueskyProfile(profile);
  const normalizedPosts = posts.map(normalizeBlueskyPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "bluesky",
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
    platform: "bluesky",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshBlueskyTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchBlueskyProfile(accessToken: string, did: string) {
  return {
    handle: "placeholder.bsky.social",
    avatar: "",
    followersCount: 0,
    followsCount: 0,
  };
}

async function fetchBlueskyPosts(accessToken: string, did: string) {
  return [
    {
      uri: "1",
      text: "Placeholder Bluesky Post",
      embed: null,
      likeCount: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
    },
  ];
}

function normalizeBlueskyProfile(raw: any) {
  return {
    username: raw.handle ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followersCount ?? 0,
    following: raw.followsCount ?? 0,
  };
}

function normalizeBlueskyPost(raw: any) {
  return {
    platform: "bluesky",
    post_id: raw.uri,
    caption: raw.text ?? "",
    media_url: raw.embed?.images?.[0]?.fullsize ?? "",
    likes: raw.likeCount ?? 0,
    comments: raw.replyCount ?? 0,
    posted_at: raw.createdAt ?? new Date().toISOString(),
  };
}