// lib/socials/odysee.ts

export async function syncOdysee(
  account: OdyseeAccount,
  supabase: SupabaseClientLike
): Promise<SyncResult> {
  const { username, user_id } = account;

  if (!username) {
    return {
      platform: "odysee",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchOdyseeProfile(username);
  const posts = await fetchOdyseeVideos(username);

  const normalizedProfile = normalizeOdyseeProfile(profile);
  const normalizedPosts = posts.map(normalizeOdyseeVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "odysee",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0, // Odysee does not expose following count
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
    platform: "odysee",
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

type OdyseeAccount = {
  username: string;
  user_id: string;
};

type RawOdyseeProfile = {
  name?: string;
  thumbnail_url?: string;
  followers?: number;
};

type RawOdyseeVideo = {
  id: string;
  title?: string;
  thumbnail_url?: string;
  views?: number;
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

async function fetchOdyseeProfile(
  username: string
): Promise<RawOdyseeProfile> {
  return {
    name: "Placeholder Odysee Channel",
    thumbnail_url: "",
    followers: 0,
  };
}

async function fetchOdyseeVideos(
  username: string
): Promise<RawOdyseeVideo[]> {
  return [
    {
      id: "1",
      title: "Placeholder Odysee Video",
      thumbnail_url: "",
      views: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeOdyseeProfile(
  raw: RawOdyseeProfile
): NormalizedProfile {
  return {
    username: raw.name ?? "",
    avatar_url: raw.thumbnail_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeOdyseeVideo(
  raw: RawOdyseeVideo
): NormalizedPost {
  return {
    platform: "odysee",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.views ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}