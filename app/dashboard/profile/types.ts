// app/dashboard/profile/types.ts

export type UserAvatar = {
  display_name?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  avatar_url?: string | null;
};

export type SocialLink = {
  id: string;
  handle: string;
  enabled: boolean;
  linktree?: boolean;
  metrics: { power_level: number };
};