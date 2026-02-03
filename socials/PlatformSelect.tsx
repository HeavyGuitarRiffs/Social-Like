"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Platform {
  id: string;
  name: string;
  icon: string;
}

interface PlatformSelectProps {
  platforms: Platform[];
  connected: string[];
  onSelect: (platformId: string) => void;
}

export default function PlatformSelect({ platforms, connected, onSelect }: PlatformSelectProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-full">Choose Platform</Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2 space-y-2">
        {platforms.map((p) => {
          const disabled = connected.includes(p.id);

          return (
            <button
              key={p.id}
              disabled={disabled}
              onClick={() => onSelect(p.id)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${
                disabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-base-200"
              }`}
            >
              <Image src={p.icon} alt={p.name} width={20} height={20} />
              <span>{p.name}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}