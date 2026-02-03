// lib/socials/vimeo.ts

export async function syncVimeo(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "vimeo",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshVimeoTokenIfNeeded(account, supabase);

  const profile = await fetchVimeoProfile(refreshed.access_token);
  const posts = await fetchVimeoVideos(refreshed.access_token);

  const normalizedProfile = normalizeVimeoProfile(profile);
  const normalizedPosts = posts.map(normalizeVimeoVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "vimeo",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(normalizedPosts);
  }

  return {
    platform: "vimeo",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshVimeoTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchVimeoProfile(accessToken: string) {
  return {
    name: "Placeholder Vimeo Creator",
    pictures: { base_link: "" },
    metadata: { followers: 0 },
  };
}

async function fetchVimeoVideos(accessToken: string) {
  return [
    {
      id: "1",
      name: "Placeholder Vimeo Video",
      pictures: { base_link: "" },
      likes: { total: 0 },
      comments: { total: 0 },
      created_time: new Date().toISOString(),
    },
  ];
}

function normalizeVimeoProfile(raw: any) {
  return {
    username: raw.name ?? "",
    avatar_url: raw.pictures?.base_link ?? "",
    followers: raw.metadata?.followers ?? 0,
  };
}

function normalizeVimeoVideo(raw: any) {
  return {
    platform: "vimeo",
    post_id: raw.id,
    caption: raw.name ?? "",
    media_url: raw.pictures?.base_link ?? "",
    likes: raw.likes?.total ?? 0,
    comments: raw.comments?.total ?? 0,
    posted_at: raw.created_time ?? new Date().toISOString(),
  };
}