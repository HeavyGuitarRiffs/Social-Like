// lib/socials/telegram.ts

export async function syncTelegram(
  account: TelegramAccount,
  supabase: SupabaseClientLike
): Promise<SyncResult> {
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
    following: 0, // Telegram does not expose following count
    last_synced: new Date().toISOString(),
  });

  if (normalizedPosts.length > 0) {
    await supabase.from("social_posts").upsert(
      normalizedPosts.map((p) => ({
        ...p,
        user_id,
      }))
    );
  }

  return {
    platform: "telegram",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type TelegramAccount = {
  access_token: string;
  user_id: string;
};

type RawTelegramProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawTelegramMessage = {
  id: string;
  text?: string;
  media_url?: string;
  created_at?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
  followers: number;
};

type NormalizedPost = {
  platform: string;
  post_id: string;
  caption: string;
  media_url: string;
  likes: number;
  comments: number;
  posted_at: string;
};

type SupabaseClientLike = {
  from: (table: string) => {
    upsert: (values: unknown) => Promise<unknown>;
  };
};

type SyncResult = {
  platform: string;
  updated: boolean;
  posts?: number;
  metrics?: boolean;
  error?: string;
};

/* -----------------------------
   Helpers
------------------------------*/

async function refreshTelegramTokenIfNeeded(
  account: TelegramAccount,
  supabase: SupabaseClientLike
): Promise<TelegramAccount> {
  return account; // placeholder logic
}

async function fetchTelegramProfile(
  accessToken: string
): Promise<RawTelegramProfile> {
  return {
    username: "Placeholder Telegram User",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchTelegramMessages(
  accessToken: string
): Promise<RawTelegramMessage[]> {
  return [
    {
      id: "1",
      text: "Placeholder Telegram message",
      media_url: "",
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeTelegramProfile(
  raw: RawTelegramProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeTelegramMessage(
  raw: RawTelegramMessage
): NormalizedPost {
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