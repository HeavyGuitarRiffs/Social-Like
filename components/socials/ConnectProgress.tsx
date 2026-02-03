"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Platform {
  id: string;
  name: string;
  icon: string; // path to icon
}

interface ConnectProgressProps {
  connected: Platform[];
  limit: number;
  onAdd: () => void;
}

export default function ConnectProgress({ connected, limit, onAdd }: ConnectProgressProps) {
  const percent = Math.min((connected.length / limit) * 100, 100);

  return (
    <div className="p-6 bg-base-200 rounded-xl border border-base-300 space-y-4">
      <div className="flex justify-between items-center">
        <p className="font-semibold">Connected Socials</p>
        <Badge>{connected.length} / {limit}</Badge>
      </div>

      <Progress value={percent} className="h-2" />

      <div className="flex gap-3 flex-wrap pt-2">
        {connected.map((p) => (
          <div key={p.id} className="flex items-center gap-2 bg-base-300 px-3 py-1 rounded-lg">
            <Image src={p.icon} alt={p.name} width={18} height={18} />
            <span className="text-sm">{p.name}</span>
          </div>
        ))}
      </div>

      {connected.length < limit && (
        <Button className="w-full mt-4" onClick={onAdd}>
          Add Social
        </Button>
      )}
    </div>
  );
}