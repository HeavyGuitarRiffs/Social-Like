// lib/socials/areyoudead.ts

export async function syncAreYouDead(
  account: AYDAccount,
  supabase: SupabaseClientLike
) {
  const { username, user_id } = account;

  if (!username) {
    return {
      platform: "areyoudead",
      updated: false,
      error: "Missing username",
    };
  }

  const profile = await fetchAYDProfile(username);
  const posts = await fetchAYDPosts(username);

  const normalizedProfile = normalizeAYDProfile(profile);
  const normalizedPosts = posts.map(normalizeAYDPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "areyoudead",
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
    platform: "areyoudead",
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

type AYDAccount = {
  username: string;
  user_id: string;
};

type RawAYDProfile = {
  username?: string;
  image_url?: string;
  followers?: number;
};

type RawAYDPost = {
  id: string;
  title?: string;
  image_url?: string;
  likes?: number;
  comments?: number;
  posted_at?: string;
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

async function fetchAYDProfile(
  username: string
): Promise<RawAYDProfile> {
  return {
    username,
    image_url: "",
    followers: Math.floor(Math.random() * 1000),
  };
}

async function fetchAYDPosts(
  username: string
): Promise<RawAYDPost[]> {
  return Array.from({
    length: Math.floor(Math.random() * 3),
  }).map((_, i) => ({
    id: `${username}-${i}`,
    title: `Are You Dead Post ${i + 1}`,
    image_url: "",
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 10),
    posted_at: new Date().toISOString(),
  }));
}

function normalizeAYDProfile(
  raw: RawAYDProfile
): NormalizedProfile {
  return {
    username: raw.username ?? "",
    avatar_url: raw.image_url ?? "",
    followers: raw.followers ?? 0,
  };
}

function normalizeAYDPost(
  raw: RawAYDPost
): NormalizedPost {
  return {
    platform: "areyoudead",
    post_id: raw.id,
    caption: raw.title ?? "",
    media_url: raw.image_url ?? "",
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    posted_at: raw.posted_at ?? new Date().toISOString(),
  };
}