"use client";

import { Badge } from "@/components/ui/badge";

interface SocialLimitBadgeProps {
  connected: number;
  limit: number;
}

export default function SocialLimitBadge({ connected, limit }: SocialLimitBadgeProps) {
  const remaining = limit - connected;

  let color = "bg-success text-success-content";
  if (remaining === 0) color = "bg-destructive text-destructive-content";
  else if (remaining === 1) color = "bg-warning text-warning-content";

  return (
    <Badge className={`${color} px-3 py-1`}>
      {connected} / {limit} connected
    </Badge>
  );
}