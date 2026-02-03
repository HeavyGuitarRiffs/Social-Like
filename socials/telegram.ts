// lib/socials/telegram.ts

export async function syncTelegram(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "telegram",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshTelegramTokenIfNeeded(account, supabase);

  const profile = await fetchTelegramProfile(refreshed.access_token);
  const posts = await fetchTelegramMessages(refreshed.access_token);

  const normalizedProfile = normalizeTelegramProfile(profile);
  const normalizedPosts = posts.map(normalizeTelegramMessage);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "telegram",
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
    platform: "telegram",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshTelegramTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchTelegramProfile(accessToken: string) {
  return {
    username: "Placeholder Telegram User",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchTelegramMessages(accessToken: string) {
  return [
    {
      id: "1",
      text: "Placeholder Telegram message",
      media_url: "",
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTelegramProfile(raw: any) {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeTelegramMessage(raw: any) {
  return {
    platform: "telegram",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.media_url ?? "",
    likes: 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}