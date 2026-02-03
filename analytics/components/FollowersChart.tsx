"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/supabase/types";
import type { DateRangeValue } from "./DateRangePicker";

// Props expected by AnalyticsPage
type ChartProps = {
  range: DateRangeValue;
  platforms: string[];
};

// Strongly typed row from your Supabase schema
type SocialDailyStatsRow =
  Database["public"]["Tables"]["social_daily_stats"]["Row"];

type DailyMetric = {
  date: string;
  followers: number;
};

const chartConfig = {
  followers: {
    label: "Followers",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function FollowersChart({ range, platforms }: ChartProps) {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [timeRange, setTimeRange] = React.useState(range);
  const [data, setData] = React.useState<DailyMetric[]>([]);

  React.useEffect(() => {
    async function load() {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      // Fetch connected socials (filtered by selected platforms)
      const { data: socials } = await supabase
        .from("user_socials")
        .select("id, platform")
        .eq("user_id", user.user.id)
        .eq("enabled", true)
        .in("platform", platforms)
        .returns<{ id: string; platform: string }[]>();

      if (!socials) return;

      const socialIds = socials.map((s) => s.id);

      // Fetch daily follower totals
      const { data: daily } = await supabase
        .from("social_daily_stats")
        .select("date, followers, user_social_id")
        .in("user_social_id", socialIds)
        .order("date", { ascending: true })
        .returns<
          Pick<
            SocialDailyStatsRow,
            "date" | "followers" | "user_social_id"
          >[]
        >();

      if (!daily) return;

      // Group by date → sum followers across selected socials
      const grouped: Record<string, number> = {};

      daily.forEach((row) => {
        if (!grouped[row.date]) grouped[row.date] = 0;
        grouped[row.date] += row.followers ?? 0;
      });

      const formatted = Object.entries(grouped).map(
        ([date, followers]) => ({
          date,
          followers,
        })
      );

      setData(formatted);
    }

    load();
  }, [platforms, range]);

  // Filter by time range
  const filteredData = React.useMemo(() => {
    if (!data.length) return [];

    const referenceDate = new Date(data[data.length - 1].date);

    const days =
      timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90;

    const start = new Date(referenceDate);
    start.setDate(start.getDate() - days);

    return data.filter((d) => new Date(d.date) >= start);
  }, [data, timeRange]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Follower Growth</CardTitle>
          <CardDescription>
            Your total followers across selected platforms
          </CardDescription>
        </div>

        <Select
  value={timeRange}
  onValueChange={(v) => setTimeRange(v as DateRangeValue)}
>
          <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient
                id="fillFollowers"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="followers"
              type="natural"
              fill="url(#fillFollowers)"
              stroke="var(--chart-1)"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}