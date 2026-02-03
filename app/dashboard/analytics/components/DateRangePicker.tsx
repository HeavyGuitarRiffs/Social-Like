//app\dashboard\analytics\components\DateRangePicker.tsx

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type DateRangeValue =
  | "1d"
  | "7d"
  | "30d"
  | "90d"
  | "180d"
  | "365d";

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

const OPTIONS: { label: string; value: DateRangeValue }[] = [
  { label: "Today", value: "1d" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "90d" },
  { label: "Last 6 months", value: "180d" },
  { label: "Last 12 months", value: "365d" },
];

export function DateRangePicker({
  value,
  onChange,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              selected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}