// lib/socials/types.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";
import type { Account as SocialAccount } from "./socialIndex";

export type SocialSupabase = SupabaseClient<Database>;
export type { SocialAccount };

export type NormalizedProfile = {
  username: string;
  avatar_url: string;
  followers: number;
  following: number;
};

export type NormalizedPost = {
  platform: string;
  post_id: string;
  caption: string;
  media_url: string;
  likes: number;
  comments: number;
  posted_at: string;
};