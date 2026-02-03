"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface SocialConnectCardProps {
  platformId: string;
  platformName: string;
  platformIcon: string;
  onSuccess: () => void;
}

export default function SocialConnectCard({
  platformId,
  platformName,
  platformIcon,
  onSuccess,
}: SocialConnectCardProps) {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);

  async function connect() {
    setLoading(true);

    await supabase.from("user_socials").insert({
      platform: platformId,
      handle,
      created_at: new Date().toISOString(),
    });

    setLoading(false);
    onSuccess();
  }

  return (
    <Card className="border border-base-300 bg-base-200">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Image src={platformIcon} alt={platformName} width={28} height={28} />
          <p className="font-semibold text-lg">{platformName}</p>
        </div>

        <Input
          placeholder={`Enter your ${platformName} username or URL`}
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
        />

        <Button className="w-full" disabled={!handle || loading} onClick={connect}>
          {loading ? "Connecting..." : "Connect"}
        </Button>
      </CardContent>
    </Card>
  );
}