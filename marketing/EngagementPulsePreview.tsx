//components\marketing\EngagementPulsePreview.tsx

"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// -------------------- Mock Data --------------------
const MOCK_SOCIALS = [
  { name: "Instagram", value: 120, fill: "var(--color-instagram)" },
  { name: "TikTok", value: 87, fill: "var(--color-tiktok)" },
  { name: "YouTube", value: 45, fill: "var(--color-youtube)" },
  { name: "Twitter", value: 62, fill: "var(--color-twitter)" },
];

interface EngagementPulseCardProps {
  metric: string;
  timeRange?: "7d" | "30d" | "90d";
  view?: "pie" | "area" | "bar";
  allowViewToggle?: boolean;
  shareable?: boolean;
  isMock?: boolean;
}

export function EngagementPulseCard({
  metric,
  timeRange = "7d",
  view = "pie",
  allowViewToggle = true,
  shareable = true,
  isMock = true,
}: EngagementPulseCardProps) {
  const [chartType, setChartType] = useState<"pie" | "area" | "bar">(view);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalValue = useMemo(() => MOCK_SOCIALS.reduce((sum, s) => sum + s.value, 0), []);

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard?metric=${metric}&range=${timeRange}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  return (
    <Card ref={cardRef} className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{metric.replace("_", " ").toUpperCase()}</CardTitle>
            <CardDescription>
              {isMock ? "Mock Data Preview" : "Live Chart Data"} ({timeRange})
            </CardDescription>
          </div>
          {shareable && (
            <Button variant="outline" size="sm" className="gap-1" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="h-[250px] flex items-center justify-center">
        {chartType === "pie" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={MOCK_SOCIALS} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {MOCK_SOCIALS.map((s) => (
                  <Cell key={s.name} fill={s.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
        {chartType === "area" && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Area chart preview
          </div>
        )}
        {chartType === "bar" && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Bar chart preview
          </div>
        )}
      </CardContent>

      {allowViewToggle && (
        <CardFooter className="flex gap-2">
          {(["pie", "area", "bar"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={chartType === t ? "default" : "outline"}
              onClick={() => setChartType(t)}
            >
              {t.toUpperCase()}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
