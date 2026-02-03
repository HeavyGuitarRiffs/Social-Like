import { syncBandcamp } from "./bandcamp";
import { syncDouyin } from "./douyin";
import { syncXiaohongshu } from "./xiaohongshu";
import { syncKuaishou } from "./kuaisho"; // exact file name


// Mapping of platform names to sync functions
const platformMap: Record<string, (account: Account, supabase: any) => Promise<SyncResult>> = {
  bandcamp: syncBandcamp,
  douyin: syncDouyin,
  xiaohongshu: syncXiaohongshu,
  kuaishou: syncKuaishou,
};

export interface Account {
  username?: string;
  user_id: string;
}

export interface SyncResult {
  platform: string;
  updated: boolean;
  error?: string;
  posts?: number;
  metrics?: boolean;
}

/**
 * Sync a single platform account dynamically.
 * @param platform The platform name as string
 * @param account The account info
 * @param supabase Supabase client
 */
export async function syncPlatform(platform: string, account: Account, supabase: any): Promise<SyncResult> {
  const syncFn = platformMap[platform.toLowerCase()];
  if (!syncFn) {
    return { platform, updated: false, error: `Unsupported platform: ${platform}` };
  }
  try {
    return await syncFn(account, supabase);
  } catch (err: any) {
    console.error(`Error syncing ${platform}:`, err);
    return { platform, updated: false, error: err.message || "Unknown error" };
  }
}

/**
 * Sync multiple accounts at once.
 * Returns an array of SyncResults.
 */
export async function syncMultipleAccounts(accounts: { platform: string; account: Account }[], supabase: any) {
  const results: SyncResult[] = [];
  for (const { platform, account } of accounts) {
    const result = await syncPlatform(platform, account, supabase);
    results.push(result);
  }
  return results;
}
