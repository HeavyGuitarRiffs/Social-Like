//app\dashboard\analytics\components\PlatformSelector.tsx

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Mode = "total" | "platforms";

interface PlatformSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;

  platforms: string[];
  selectedPlatforms: string[];
  onPlatformChange: (platforms: string[]) => void;
}

export function PlatformSelector({
  mode,
  onModeChange,
  platforms,
  selectedPlatforms,
  onPlatformChange,
}: PlatformSelectorProps) {
  function togglePlatform(platform: string): void {
    if (selectedPlatforms.includes(platform)) {
      onPlatformChange(selectedPlatforms.filter((p) => p !== platform));
    } else {
      onPlatformChange([...selectedPlatforms, platform]);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={mode === "total" ? "default" : "outline"}
          size="sm"
          className="rounded-lg"
          onClick={() => onModeChange("total")}
        >
          Total
        </Button>

        <Button
          variant={mode === "platforms" ? "default" : "outline"}
          size="sm"
          className="rounded-lg"
          onClick={() => onModeChange("platforms")}
        >
          Platforms
        </Button>
      </div>

      {/* Platform Pills */}
      {mode === "platforms" && (
        <div className="flex flex-wrap items-center gap-2">
          {platforms.map((platform) => {
            const selected = selectedPlatforms.includes(platform);

            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

