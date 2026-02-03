"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import type { MetricConfig } from "@/app/dashboard/types";
import { toast } from "sonner";

type Props = {
  targetRef: React.RefObject<HTMLDivElement | null>;
  metric: MetricConfig;
};

export function ChartShareButton({ targetRef, metric }: Props) {
  // Smart formatter (same logic as your charts)
  function formatNumber(n: number) {
    if (n >= 10_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 100_000) return (n / 1_000).toFixed(0) + "k";
    if (n >= 10_000) return (n / 1_000).toFixed(1) + "k";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return n.toString();
  }

  async function handleShare() {
    // Convert to number to satisfy TypeScript
    const numericValue = Number(metric.value);
    const formattedValue = formatNumber(numericValue);

    const shareUrl =
      typeof window !== "undefined" ? window.location.href : "";

    // Safe fallback if rangeLabel doesn't exist
    const rangeLabel =
      (metric as any).rangeLabel ?? "Last period";

    const shareText = `My ${metric.label} (${rangeLabel}) on Social Like: ${formattedValue}\n#SocialLikeAnalytics`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My creator analytics",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success("Copied to clipboard!");
      } catch {
        toast.error("Could not copy to clipboard");
      }
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="inline-flex items-center gap-2"
      onClick={handleShare}
    >
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  );
}