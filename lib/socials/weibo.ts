// lib/socials/weibo.ts

export async function syncWeibo(
  account: WeiboAccount,
  supabase: SupabaseClientLike
): Promise<SyncResult> {
  const { access_token, user_id } = account;

  if (!access_token) {
    return {
      platform: "weibo",
      updated: false,
      error: "Missing access token",
    };
  }

  const refreshed = await refreshWeiboTokenIfNeeded(account, supabase);

  const profile = await fetchWeiboProfile(refreshed.access_token);
  const posts = await fetchWeiboPosts(refreshed.access_token);

  const normalizedProfile = normalizeWeiboProfile(profile);
  const normalizedPosts = posts.map(normalizeWeiboPost);

  await supabase.from("social_profiles").upsert({
    user_id,
    platform: "weibo",
    username: normalizedProfile.username,
    avatar_url: normalizedProfile.avatar_url,
    followers: normalizedProfile.followers,
    following: normalizedProfile.following,
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
    platform: "weibo",
    updated: true,
    posts: normalizedPosts.length,
    metrics: true,
  };
}

/* -----------------------------
   Local Types
------------------------------*/

type WeiboAccount = {
  access_token: string;
  user_id: string;
};

type RawWeiboProfile = {
  screen_name?: string;
  avatar_hd?: string;
  followers_count?: number;
  friends_count?: number;
};

type RawWeiboPost = {
  id: string;
  text?: string;
  pic_url?: string;
  attitudes_count?: number;
  comments_count?: number;
  created_at?: string;
};

type NormalizedProfile = {
  username: string;
  avatar_url: string;
  followers: number;
  following: number;
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

async function refreshWeiboTokenIfNeeded(
  account: WeiboAccount,
  supabase: SupabaseClientLike
): Promise<WeiboAccount> {
  return account; // placeholder logic
}

async function fetchWeiboProfile(
  accessToken: string
): Promise<RawWeiboProfile> {
  return {
    screen_name: "Placeholder Weibo User",
    avatar_hd: "",
    followers_count: 0,
    friends_count: 0,
  };
}

async function fetchWeiboPosts(
  accessToken: string
): Promise<RawWeiboPost[]> {
  return [
    {
      id: "1",
      text: "Placeholder Weibo Post",
      pic_url: "",
      attitudes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeWeiboProfile(
  raw: RawWeiboProfile
): NormalizedProfile {
  return {
    username: raw.screen_name ?? "",
    avatar_url: raw.avatar_hd ?? "",
    followers: raw.followers_count ?? 0,
    following: raw.friends_count ?? 0,
  };
}

function normalizeWeiboPost(
  raw: RawWeiboPost
): NormalizedPost {
  return {
    platform: "weibo",
    post_id: raw.id,
    caption: raw.text ?? "",
    media_url: raw.pic_url ?? "",
    likes: raw.attitudes_count ?? 0,
    comments: raw.comments_count ?? 0,
    posted_at: raw.created_at ?? new Date().toISOString(),
  };
}