//app\dashboard\linktree\components\LinkAnalyticsOverview.tsx
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import LinkAnalytics from "./LinkAnalytics";
import LinkAnalyticsLinks from "./LinkAnalyticsLinks";
import LinkAnalyticsCountries from "./LinkAnalyticsCountries";
import LinkAnalyticsReferrers from "./LinkAnalyticsReferrers";
import LinkAnalyticsDevices from "./LinkAnalyticsDevices";

import type { DateRangeValue } from "@/app/dashboard/analytics/components/DateRangePicker";

export default function LinkAnalyticsOverview() {
  // Default preview range + platforms for overview cards
  const range: DateRangeValue = "7d";

  const platforms = ["instagram", "tiktok", "youtube"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Overview */}
      <Link href="/dashboard/linktree/analytics">
        <Card className="cursor-pointer hover:bg-accent transition">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] overflow-hidden pointer-events-none">
              <LinkAnalytics range={range} platforms={platforms} preview />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Top Links */}
      <Link href="/dashboard/linktree/links">
        <Card className="cursor-pointer hover:bg-accent transition">
          <CardHeader>
            <CardTitle>Top Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] overflow-hidden pointer-events-none">
              <LinkAnalyticsLinks range={range} platforms={platforms} preview />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Countries */}
      <Link href="/dashboard/linktree/countries">
        <Card className="cursor-pointer hover:bg-accent transition">
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] overflow-hidden pointer-events-none">
              <LinkAnalyticsCountries range={range} platforms={platforms} preview />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Referrers */}
      <Link href="/dashboard/linktree/referrers">
        <Card className="cursor-pointer hover:bg-accent transition">
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] overflow-hidden pointer-events-none">
              <LinkAnalyticsReferrers range={range} platforms={platforms} preview />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Devices */}
      <Link href="/dashboard/linktree/devices">
        <Card className="cursor-pointer hover:bg-accent transition">
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] overflow-hidden pointer-events-none">
              <LinkAnalyticsDevices range={range} platforms={platforms} preview />
            </div>
          </CardContent>
        </Card>
      </Link>

    </div>
  );
}