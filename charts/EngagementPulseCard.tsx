"use client";

import React, { useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface EngagementPulseCardProps {
  metric: string;
  timeRange?: "7d" | "30d" | "90d";
  view?: "line" | "bar" | "area" | "pie";
  allowViewToggle?: boolean;
  shareable?: boolean;
  isMock?: boolean;
}

export function EngagementPulseCard({
  metric,
  timeRange = "7d",
  view = "area",
  allowViewToggle = true,
  shareable = true,
  isMock = false,
}: EngagementPulseCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Smart number formatter (same as charts)
  function formatNumber(n: number) {
    if (n >= 10_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 100_000) return (n / 1_000).toFixed(0) + "k";
    if (n >= 10_000) return (n / 1_000).toFixed(1) + "k";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return n.toString();
  }

  // Human-readable range label
  const rangeLabelMap: Record<string, string> = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
  };

  const prettyRange = rangeLabelMap[timeRange] ?? "Recent Activity";

  // Share handler (premium version)
  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard?metric=${metric}&range=${timeRange}`;
    const shareText = `My ${metric.replace("_", " ")} (${prettyRange}) on Social Like\n${url}\n#SocialLikeAnalytics`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My creator analytics",
          text: shareText,
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Could not copy link");
      }
    }
  };

  return (
    <Card ref={cardRef} className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex flex-col">
          <span>{metric.replace("_", " ").toUpperCase()}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {prettyRange}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="min-h-[150px]">
        {/* Placeholder chart area */}
        <div className="w-full h-48 flex items-center justify-center bg-muted/20 rounded-lg text-muted-foreground">
          {isMock ? "Chart Preview (Mock Data)" : "Live Chart"}
        </div>
      </CardContent>

      {(allowViewToggle || shareable) && (
        <CardFooter className="flex items-center justify-between">
          {/* View toggle placeholder (future expansion) */}
          {allowViewToggle && (
            <div className="text-sm text-muted-foreground">
              View: {view.toUpperCase()}
            </div>
          )}

          {shareable && (
            <Button
              onClick={handleShare}
              size="sm"
              variant="outline"
              className="gap-1"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}