// lib/socials/steam.ts

export async function syncSteam(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "steam",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshSteamTokenIfNeeded(account, supabase);

  const profile = await fetchSteamProfile(refreshed.access_token);
  const posts = await fetchSteamActivity(refreshed.access_token);

  const normalizedProfile = normalizeSteamProfile(profile);
  const normalizedPosts = posts.map(normalizeSteamEvent);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "steam",
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
    platform: "steam",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshSteamTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchSteamProfile(accessToken: string) {
  return {
    personaname: "Placeholder Gamer",
    avatarfull: "",
    followers: 0,
  };
}

async function fetchSteamActivity(accessToken: string) {
  return [
    {
      id: "1",
      game: "Placeholder Game",
      action: "Played",
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeSteamProfile(raw: any) {
  return {
    username: raw.personaname ?? "",
    avatar_url: raw.avatarfull ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeSteamEvent(raw: any) {
  return {
    platform: "steam",
    post_id: raw.id,
    caption: `${raw.action} ${raw.game}`,
    media_url: "",
    likes: 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}