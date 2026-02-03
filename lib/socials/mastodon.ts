// lib/socials/mastodon.ts

export async function syncMastodon(account: any, supabase: any) {
  const { access_token, user_id, instance_url } = account;

  if (!access_token || !instance_url) {
    return {
      platform: "mastodon",
      updated: false,
      error: "Missing access token or instance URL",
    };
  }

  const refreshed = await refreshMastodonTokenIfNeeded(account, supabase);

  const profile = await fetchMastodonProfile(refreshed.access_token, instance_url);
  const posts = await fetchMastodonStatuses(refreshed.access_token, instance_url);

  const normalizedProfile = normalizeMastodonProfile(profile);
  const normalizedPosts = posts.map(normalizeMastodonStatus);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "mastodon",
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
    platform: "mastodon",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshMastodonTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchMastodonProfile(accessToken: string, instance: string) {
  return {
    username: "placeholder",
    avatar: "",
    followers_count: 0,
    following_count: 0,
  };
}

async function fetchMastodonStatuses(accessToken: string, instance: string) {
  return [
    {
      id: "1",
      content: "Placeholder Mastodon Toot",
      media_attachments: [],
      favourites_count: 0,
      replies_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeMastodonProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.following_count ?? 0,
  };
}

function normalizeMastodonStatus(raw: any) {
  return {
    platform: "mastodon",
    post_id: raw.id,
    caption: raw.content ?? "",
    media_url: raw.media_attachments?.[0]?.url ?? "",
    likes: raw.favourites_count ?? 0,
    comments: raw.replies_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}