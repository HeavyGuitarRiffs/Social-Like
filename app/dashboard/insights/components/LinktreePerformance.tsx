// app/dashboard/insights/components/LinktreePerformance.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/supabase/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type LinktreeLinkRow =
  Database["public"]["Tables"]["linktree_links"]["Row"];

type LinktreeClicksDailyRow =
  Database["public"]["Tables"]["linktree_clicks_daily"]["Row"];

type LinkSummary = {
  id: string;
  title: string;
  url: string;
  totalClicks: number;
  lastClicked: string | null;
};

export function LinktreePerformance() {
  const supabase = createClient();

  const [loading, setLoading] = React.useState(true);
  const [links, setLinks] = React.useState<LinkSummary[]>([]);
  const [totalClicks, setTotalClicks] = React.useState(0);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);

const { data: linkRows } = await supabase
  .from("linktree_links")
  .select("id"); // temporary safe select

      if (!linkRows || linkRows.length === 0) {
        setLinks([]);
        setTotalClicks(0);
        setLoading(false);
        return;
      }

      const { data: clickRows } = await supabase
        .from("linktree_clicks_daily")
        .select("link_id, clicks, date")
        .returns<
          Pick<LinktreeClicksDailyRow, "link_id" | "clicks" | "date">[]
        >();

      const summaryMap = new Map<string, LinkSummary>();

      for (const link of linkRows) {
 summaryMap.set(link.id, {
  id: link.id,
  title: "Untitled link",
  url: "",
  totalClicks: 0,
  lastClicked: null,
});
}

      let total = 0;

      clickRows?.forEach((row) => {
        const entry = summaryMap.get(row.link_id);
        if (!entry) return;

        const clicks = row.clicks ?? 0;
        entry.totalClicks += clicks;
        total += clicks;

        if (!entry.lastClicked || row.date > entry.lastClicked) {
          entry.lastClicked = row.date;
        }
      });

      const summaries = Array.from(summaryMap.values()).sort(
        (a, b) => b.totalClicks - a.totalClicks,
      );

      setLinks(summaries);
      setTotalClicks(total);
      setLoading(false);
    };

    load();
  }, [supabase]);

  const topLink = links[0] ?? null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Linktree Performance</CardTitle>
        <CardDescription>
          High-level performance of your Linktree links
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="py-4 text-sm text-muted-foreground">
            Loading Linktree performance…
          </div>
        )}

        {!loading && links.length === 0 && (
          <div className="py-4 text-sm text-muted-foreground">
            No Linktree links found yet.
          </div>
        )}

        {!loading && links.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">
                  Total clicks
                </div>
                <div className="text-2xl font-semibold">
                  {totalClicks}
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">
                  Active links
                </div>
                <div className="text-2xl font-semibold">
                  {links.length}
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">
                  Top link
                </div>
                <div className="text-sm font-medium truncate">
                  {topLink ? topLink.title : "—"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {topLink ? topLink.url : ""}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Top links
              </div>

              <div className="space-y-2">
                {links.slice(0, 5).map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {link.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {link.url}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {link.totalClicks}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        clicks
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}