"use client";

import React from "react";
import { cn } from "@/lib/utils";

type GoalPreset = {
  title: string;
  description: string;
  metric: string;
  target: number;
  icon?: React.ReactNode;
};

type Props = {
  preset: GoalPreset;
  onSelect: (preset: GoalPreset) => void;
  className?: string;
};

export function GoalPresetCard({ preset, onSelect, className }: Props) {
  return (
    <button
      onClick={() => onSelect(preset)}
      className={cn(
        "w-full rounded-lg border p-4 text-left transition hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {preset.icon && <div className="text-2xl">{preset.icon}</div>}

        <div className="flex flex-col">
          <span className="font-semibold">{preset.title}</span>
          <span className="text-sm text-muted-foreground">
            {preset.description}
          </span>
        </div>
      </div>

      <div className="mt-3 text-sm text-muted-foreground">
        Target: {preset.target.toLocaleString()} {preset.metric}
      </div>
    </button>
  );
}