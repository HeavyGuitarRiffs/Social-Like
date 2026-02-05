// lib/socials/socialIndex.ts

import { syncBandcamp } from "./bandcamp";
import { syncDouyin } from "./douyin";
import { syncXiaohongshu } from "./xiaohongshu";
import { syncKuaishou } from "./kuaishou";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export type SyncFunction = (
  account: Account,
  supabase: SupabaseClient<Database>
) => Promise<SyncResult>;

export interface Account {
  account_id: string;
  user_id: string;

  username?: string;
  access_token?: string;
  refresh_token?: string;
  instance_url?: string;
  wallet_address?: string;
  eth_address?: string;
}

export interface SyncResult {
  platform: string;
  updated: boolean;
  error?: string;
  posts?: number;
  metrics?: boolean;
}

const platformMap: Record<string, SyncFunction> = {
  bandcamp: syncBandcamp,
  douyin: syncDouyin,
  xiaohongshu: syncXiaohongshu,
  kuaishou: syncKuaishou,
};

export async function syncPlatform(
  platform: string,
  account: Account,
  supabase: SupabaseClient<Database>
): Promise<SyncResult> {
  const key = platform.toLowerCase();
  const syncFn = platformMap[key];

  if (!syncFn) {
    return {
      platform,
      updated: false,
      error: `Unsupported platform: ${platform}`,
    };
  }

  try {
    return await syncFn(account, supabase);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { platform, updated: false, error: message };
  }
}

export async function syncMultipleAccounts(
  accounts: { platform: string; account: Account }[],
  supabase: SupabaseClient<Database>
) {
  const results: SyncResult[] = [];

  for (const { platform, account } of accounts) {
    const result = await syncPlatform(platform, account, supabase);
    results.push(result);
  }

  return results;
}