// lib/socials/bitchute.ts

export async function syncBitChute(
  account: BitChuteAccount,
  supabase: SupabaseClientLike
) {
  const { username, user_id } = account;

  if (!username) {
    return {
      platform: "bitchute",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchBitChuteProfile(username);
  const posts = await fetchBitChuteVideos(username);

  const normalizedProfile = normalizeBitChuteProfile(profile);
  const normalizedPosts = posts.map(normalizeBitChuteVideo);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "bitchute",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: 0,
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
    platform: "bitchute",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type SupabaseClientLike = {
  from: (table: string) => {
    upsert: (values: unknown) => Promise<unknown>;
  };
};

type BitChuteAccount = {
  username: string;
  user_id: string;
};

type RawBitChuteProfile = {
  username?: string;
  avatar_url?: string;
  followers?: number;
};

type RawBitChutePost = {
  id: string;
  title?: string;
  thumbnail_url?: string;
  views?: number;
  likes?: number;
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

async function fetchBitChuteProfile(
  username: string
): Promise<RawBitChuteProfile> {
  return {
    username: "Placeholder BitChute Creator",
    avatar_url: "",
    followers: 0,
  };
}

async function fetchBitChuteVideos(
  username: string
): Promise<RawBitChutePost[]> {
  return [
    {
      id: "1",
      title: "Placeholder BitChute Video",
      thumbnail_url: "",
      views: 0,
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeBitChuteProfile(
  raw: RawBitChuteProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.avatar_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeBitChuteVideo(
  raw: RawBitChutePost
): NormalizedPost {
  return {
    platform: "bitchute",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.thumbnail_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}