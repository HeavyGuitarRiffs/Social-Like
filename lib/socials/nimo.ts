// lib/socials/nimotv.ts

export async function syncNimoTV(
  account: NimoTVAccount,
  supabase: SupabaseClientLike
): Promise<SyncResult> {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "nimotv",
      updated: false,
      error: "Missing access token",
    };
  }

  const profile = await fetchNimoTVProfile(access_token);
  const posts = await fetchNimoTVStreams(access_token);

  const normalizedProfile = normalizeNimoTVProfile(profile);
  const normalizedPosts = posts.map(normalizeNimoTVStream);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "nimotv",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // NimoTV does not expose following count
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
    platform: "nimotv",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type SyncResult = {
  platform: string;
  updated: boolean;
  posts?: number;
  metrics?: boolean;
  error?: string;
};

type SupabaseClientLike = {
  from: (table: string) => {
    upsert: (values: unknown) => Promise<unknown>;
  };
};

type NimoTVAccount = {
  access_token: string;
  user_id: string;
};

type RawNimoTVProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawNimoTVStream = {
  id: string;
  title?: string;
  thumbnail_url?: string;
  viewers?: number;
  comments?: number;
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

/* -----------------------------
   Helpers
------------------------------*/

async function fetchNimoTVProfile(
  accessToken: string
): Promise<RawNimoTVProfile> {
  return {
    username: "Placeholder NimoTV Streamer",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchNimoTVStreams(
  accessToken: string
): Promise<RawNimoTVStream[]> {
  return [
    {
      id: "1",
      title: "Placeholder NimoTV Stream",
      thumbnail_url: "",
      viewers: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeNimoTVProfile(
  raw: RawNimoTVProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeNimoTVStream(
  raw: RawNimoTVStream
): NormalizedPost {
  return {
    platform: "nimotv",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.viewers ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}