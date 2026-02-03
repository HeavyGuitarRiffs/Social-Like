// lib/socials/github.ts

export async function syncGitHub(account: any, supabase: any) {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "github",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshGitHubTokenIfNeeded(account, supabase);

  const profile = await fetchGitHubProfile(refreshed.access_token);
  const posts = await fetchGitHubActivity(refreshed.access_token);

  const normalizedProfile = normalizeGitHubProfile(profile);
  const normalizedPosts = posts.map(normalizeGitHubEvent);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "github",
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
    platform: "github",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* Helpers */

async function refreshGitHubTokenIfNeeded(account: any, supabase: any) {
  return account;
}

async function fetchGitHubProfile(accessToken: string) {
  return {
    login: "placeholder",
    avatar_url: "",
    followers: 0,
    following: 0,
  };
}

async function fetchGitHubActivity(accessToken: string) {
  return [
    {
      id: "1",
      type: "PushEvent",
      repo: { name: "placeholder/repo" },
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeGitHubProfile(raw: any) {
  return {
    username: raw.login ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
  };
}

function normalizeGitHubEvent(raw: any) {
  return {
    platform: "github",
    post_id: raw.id,
    caption: raw.type + " in " + (raw.repo?.name ?? ""),
    media_url: "",
    likes: 0,
    comments: 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}