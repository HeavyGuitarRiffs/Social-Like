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

type Mode = "total" | "platforms";

type VelocityRow = {
  date: string;
  platform: string;
  avg_reply_seconds: number;
};

type ChartRow = {
  date: string;
  total: number;
  [platform: string]: number | string;
};

type ChartProps = {
  range: DateRangeValue;
  platforms: string[];
};

export function EngagementVelocityChart({ range, platforms }: ChartProps) {
  const supabase = React.useMemo(
    () =>
      createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [timeRange, setTimeRange] = React.useState<DateRangeValue>(range);
  const [mode, setMode] = React.useState<Mode>("total");
  const [selectedPlatforms, setSelectedPlatforms] =
    React.useState<string[]>(platforms);

  const [data, setData] = React.useState<VelocityRow[]>([]);

  React.useEffect(() => {
    async function load(): Promise<void> {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch events filtered by selected platforms
      const { data: events } = await supabase
        .from("engagement_velocity")
        .select("reply_time_seconds, platform, created_at")
        .eq("user_id", user.id)
        .in("platform", selectedPlatforms)
        .order("created_at", { ascending: true });

      if (!events) return;

      const grouped: Record<
        string,
        Record<string, { sum: number; count: number }>
      > = {};

      events.forEach((row) => {
        const date = (row.created_at ?? "").split("T")[0];
        const platform = row.platform;
        const seconds = row.reply_time_seconds;

        if (!grouped[date]) grouped[date] = {};
        if (!grouped[date][platform])
          grouped[date][platform] = { sum: 0, count: 0 };

        grouped[date][platform].sum += seconds;
        grouped[date][platform].count += 1;
      });

      const formatted: VelocityRow[] = [];

      Object.entries(grouped).forEach(([date, platformMap]) => {
        Object.entries(platformMap).forEach(([platform, stats]) => {
          formatted.push({
            date,
            platform,
            avg_reply_seconds: stats.sum / stats.count,
          });
        });
      });

      setData(formatted);
    }

    load();
  }, [supabase, selectedPlatforms, range]);

  const filteredData = React.useMemo(() => {
    if (data.length === 0) return [];

    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const referenceDate = new Date(sorted[sorted.length - 1].date);

    const days =
      timeRange === "30d"
        ? 30
        : timeRange === "7d"
        ? 7
        : timeRange === "180d"
        ? 180
        : timeRange === "365d"
        ? 365
        : 90;

    const start = new Date(referenceDate);
    start.setDate(start.getDate() - days);

    return sorted.filter((d) => new Date(d.date) >= start);
  }, [data, timeRange]);

  const chartData = React.useMemo<ChartRow[]>(() => {
    if (filteredData.length === 0) return [];

    const byDate: Record<string, Record<string, number>> = {};

    filteredData.forEach((row) => {
      if (!byDate[row.date]) byDate[row.date] = {};
      byDate[row.date][row.platform] = row.avg_reply_seconds;
    });

    return Object.entries(byDate).map(([date, platformValues]) => {
      const values = Object.values(platformValues);
      const total =
        values.reduce((sum, v) => sum + v, 0) / values.length;

      return {
        date,
        total,
        ...platformValues,
      };
    });
  }, [filteredData]);

  const chartConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      total: {
        label: "Avg Reply Time (sec)",
        color: "var(--chart-1)",
      },
    };

    selectedPlatforms.forEach((p) => {
      config[p] = {
        label: p.charAt(0).toUpperCase() + p.slice(1),
        color: `var(--color-${p})`,
      };
    });

    return config;
  }, [selectedPlatforms]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Engagement Velocity</CardTitle>
          <CardDescription>
            Daily average reply time across selected platforms
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
            <SelectItem value="180d">Last 6 months</SelectItem>
            <SelectItem value="365d">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <SelectTrigger className="hidden w-[140px] rounded-lg sm:flex">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="total">Total</SelectItem>
            <SelectItem value="platforms">Platforms</SelectItem>
          </SelectContent>
        </Select>

        {mode === "platforms" && (
          <Select
            value={selectedPlatforms.join(",")}
            onValueChange={(v) => setSelectedPlatforms(v.split(","))}
          >
            <SelectTrigger className="hidden w-[200px] rounded-lg sm:flex">
              <SelectValue placeholder="Platforms" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
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

              {selectedPlatforms.map((p) => (
                <linearGradient
                  key={p}
                  id={`fill-${p}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${p})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${p})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) =>
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
                  labelFormatter={(value: string) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />

            {mode === "total" && (
              <Area
                dataKey="total"
                type="natural"
                fill="url(#fillTotal)"
                stroke="var(--chart-1)"
              />
            )}

            {mode === "platforms" &&
              selectedPlatforms.map((p) => (
                <Area
                  key={p}
                  dataKey={p}
                  type="natural"
                  fill={`url(#fill-${p})`}
                  stroke={`var(--color-${p})`}
                />
              ))}

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}