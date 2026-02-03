// lib/socials/discord.ts

export async function syncDiscord(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "discord",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshDiscordTokenIfNeeded(account, supabase);

  const profile = await fetchDiscordProfile(refreshed.access_token);
  const posts = await fetchDiscordActivity(refreshed.access_token);

  const normalizedProfile = normalizeDiscordProfile(profile);
  const normalizedPosts = posts.map(normalizeDiscordActivity);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "discord",
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
    platform: "discord",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshDiscordTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchDiscordProfile(accessToken: string) {
  return {
    username: "placeholder",
    avatar: "",
    followers: 0,
  };
}

async function fetchDiscordActivity(accessToken: string) {
  return [
    {
      id: "1",
      content: "Placeholder Discord message",
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeDiscordProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeDiscordActivity(raw: any) {
  return {
    platform: "discord",
    post_id: raw.id,
    caption: raw.content ?? "",
    media_url: "",
    likes: 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}