//app\dashboard\insights\components\LinkList.tsx

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

type LinkMeta = {
  id: string;
  title: string;
  url: string;
};

type ClickRow = {
  link_id: string;
  platform: string;
  clicks: number;
  date: string;
};

type LinkStats = {
  id: string;
  title: string;
  url: string;
  total: number;
  ctr: number;
  lastClicked: string | null;
  platforms: Record<string, number>;
  sparkline: { date: string; clicks: number }[];
};

export default function LinkList() {
  const supabase = createClient();

  const [links, setLinks] = useState<LinkStats[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"clicks" | "name" | "date">("clicks");

  useEffect(() => {
    const load = async () => {
      // Load link metadata
      const { data: linkData } = await supabase
        .from("linktree_links")
        .select("id, title, url")
        .returns<LinkMeta[]>();

      if (!linkData) return;

      // Load click stats
      const { data: clickData } = await supabase
        .from("linktree_clicks_daily")
        .select("link_id, platform, clicks, date")
        .returns<ClickRow[]>();

      const stats: Record<string, LinkStats> = {};

      linkData.forEach((link) => {
        stats[link.id] = {
          ...link,
          total: 0,
          ctr: 0,
          lastClicked: null,
          platforms: {},
          sparkline: [],
        };
      });

      clickData?.forEach((row) => {
        const entry = stats[row.link_id];
        if (!entry) return;

        entry.total += row.clicks;
        entry.platforms[row.platform] =
          (entry.platforms[row.platform] ?? 0) + row.clicks;

        entry.sparkline.push({ date: row.date, clicks: row.clicks });

        if (!entry.lastClicked || row.date > entry.lastClicked) {
          entry.lastClicked = row.date;
        }
      });

      // CTR example formula (adjust as needed)
      Object.values(stats).forEach((s) => {
        const impressions = s.total * 3; // placeholder
        s.ctr = impressions ? s.total / impressions : 0;
      });

      setLinks(Object.values(stats));
    };

    load();
  }, []);

  const sorted = [...links].sort((a, b) => {
    if (sortBy === "clicks") return b.total - a.total;
    if (sortBy === "name") return a.title.localeCompare(b.title);
    if (sortBy === "date") return (b.lastClicked ?? "").localeCompare(a.lastClicked ?? "");
    return 0;
  });

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your Links</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sorting */}
        <div className="flex gap-3 text-sm text-muted-foreground">
          <button onClick={() => setSortBy("clicks")}>Sort by Clicks</button>
          <button onClick={() => setSortBy("name")}>Sort by Name</button>
          <button onClick={() => setSortBy("date")}>Sort by Last Clicked</button>
        </div>

        {sorted.map((link) => (
          <div
            key={link.id}
            className="rounded-lg border p-4 space-y-3 cursor-pointer"
            onClick={() => toggleExpand(link.id)}
          >
            {/* Row header */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{link.title}</div>
                <div className="text-sm text-muted-foreground">{link.url}</div>
              </div>

              <div className="text-right">
                <div className="text-xl font-semibold">{link.total}</div>
                <div className="text-xs text-muted-foreground">total clicks</div>
              </div>

              {expanded === link.id ? <ChevronUp /> : <ChevronDown />}
            </div>

            {/* Sparkline */}
            <div className="h-[40px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={link.sparkline}>
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Expanded details */}
            {expanded === link.id && (
              <div className="pt-3 border-t space-y-2">
                <div className="text-sm">
                  <strong>CTR:</strong> {(link.ctr * 100).toFixed(1)}%
                </div>

                <div className="text-sm">
                  <strong>Last clicked:</strong>{" "}
                  {link.lastClicked ? new Date(link.lastClicked).toLocaleDateString() : "—"}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {Object.entries(link.platforms).map(([platform, clicks]) => (
                    <span
                      key={platform}
                      className="rounded-full bg-muted px-3 py-1 text-xs flex items-center gap-1"
                    >
                      {platformIcon(platform)}
                      {platform}: {clicks}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function platformIcon(platform: string) {
  const icons: Record<string, string> = {
    instagram: "📸",
    tiktok: "🎵",
    youtube: "▶️",
    twitter: "🐦",
    facebook: "📘",
    twitch: "🎮",
  };
  return icons[platform] ?? "🔗";
}