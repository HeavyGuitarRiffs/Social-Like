"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import SocialArchetypeCard from "@/components/profile/SocialArchetypeCard";
import HighlightedComments from "@/components/dashboard/HighlightedComments";
import AvatarUploader from "@/components/profile/AvatarUploader";

import type { UserAvatar, SocialLink } from "./types";

const supabase = createClient();

const flags: Record<string, string> = {
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  "United Kingdom": "🇬🇧",
  Germany: "🇩🇪",
  India: "🇮🇳",
  Other: "🌍",
};

type ProfilePageClientProps = {
  initialProfile: UserAvatar;
  initialSocials: SocialLink[];
  userId: string;
};

export default function ProfilePageClient({
  initialProfile,
  initialSocials,
  userId,
}: ProfilePageClientProps) {
  const [displayName, setDisplayName] = useState(initialProfile.display_name ?? "");
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [country, setCountry] = useState(initialProfile.country ?? "");
  const [timezone, setTimezone] = useState(
    initialProfile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [avatar, setAvatar] = useState<string | null>(initialProfile.avatar_url ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [socials, setSocials] = useState<SocialLink[]>(initialSocials);
  const [saving, setSaving] = useState(false);

  const completion =
    (displayName ? 20 : 0) +
    (country ? 20 : 0) +
    (bio ? 20 : 0) +
    (timezone ? 20 : 0) +
    (avatar ? 20 : 0);

  const highlightedComments = [
    "This post went viral! 🚀",
    "Loved this insight on growth hacking.",
    "Comment streak achieved!",
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const saveProfile = async () => {
    setSaving(true);

    try {
      let avatar_url = avatar;

      if (avatarFile) {
        const path = `${userId}/${avatarFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = data.publicUrl;
      }

      const { error: profileError } = await supabase
        .from("user_avatars")
        .upsert({
          user_id: userId,
          display_name: displayName,
          bio,
          country,
          timezone,
          avatar_url,
        });

      if (profileError) throw profileError;

      for (const social of socials) {
        if (!social.handle) continue;

        const { error } = await supabase.from("user_socials").upsert({
          id: social.id,
          user_id: userId,
          handle: social.handle,
          enabled: social.enabled,
          linktree: social.linktree || false,
        });

        if (error) throw error;
      }

      toast.success("Profile & socials saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const totalPowerLevel = socials.reduce(
    (sum, s) => sum + (s.metrics?.power_level ?? 0),
    0
  );
  const maxPowerLevel = socials.length * 1000;

  return (
    <main className="min-h-screen bg-base-100 px-6 py-12 text-base-content flex justify-center">
      <div className="w-full max-w-3xl">
        <section className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Your Profile</h1>
          <p className="opacity-70">
            This powers streaks, challenges, leaderboards, and rewards.
          </p>
          <Separator />
        </section>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          {/* INFO TAB */}
          <TabsContent value="info" className="space-y-8">
            <div className="space-y-3 text-center">
              <span className="text-sm">Profile completion</span>
              <Badge variant="secondary">{completion}%</Badge>
              <progress
                className="progress progress-primary w-full"
                value={completion}
                max={100}
              />
              <p className="text-xs opacity-60">
                Higher completion unlocks incentives and premium mechanics
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <HoverCard>
                <HoverCardTrigger>
                  <Avatar className="w-20 h-20">
                    {avatar ? (
                      <AvatarImage src={avatar} alt="Avatar" />
                    ) : (
                      <AvatarFallback>📷</AvatarFallback>
                    )}
                  </Avatar>
                </HoverCardTrigger>
                <HoverCardContent>
                  <p className="text-sm">
                    This avatar appears on leaderboards and comments.
                  </p>
                </HoverCardContent>
              </HoverCard>

              <Input type="file" accept="image/*" onChange={handleAvatarChange} />
              <AvatarUploader />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Display name</label>
              <Input
                placeholder="Creator123"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                placeholder="Building in public · Daily commenting"
                maxLength={140}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs opacity-60">{bio.length}/140 characters</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full">
                  {country ? `${flags[country]} ${country}` : "Select country"}
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(flags).map((c) => (
                    <SelectItem key={c} value={c}>
                      {flags[c]} {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </TabsContent>

          {/* SOCIAL TAB */}
          <TabsContent value="social" className="space-y-6">
            <SocialArchetypeCard />
            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Total Power Level</p>
              <progress
                className="progress progress-primary w-full"
                value={totalPowerLevel}
                max={maxPowerLevel || 1}
              />
              <Badge variant="secondary">{totalPowerLevel}</Badge>
            </div>

            {socials.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-1/4">{s.handle}</span>
                <progress
                  className="progress progress-accent w-3/4"
                  value={s.metrics.power_level}
                  max={1000}
                />
                <Badge variant="secondary">{s.metrics.power_level}</Badge>
              </div>
            ))}

            <Separator />
            <h3 className="text-lg font-semibold">Saved Socials</h3>

            {socials.length === 0 ? (
              <p className="text-sm opacity-60">No socials connected yet.</p>
            ) : (
              <ul className="space-y-2">
                {socials.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <span>{s.linktree ? "🔗" : "💬"}</span>
                    <span>{s.handle}</span>
                    <Badge variant={s.enabled ? "secondary" : "outline"}>
                      {s.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {/* PREFERENCES */}
          <TabsContent value="preferences" className="space-y-4 text-center">
            <h2 className="text-lg font-semibold">Engagement Preferences</h2>
            <p className="text-sm opacity-70">
              These settings control daily challenges, streaks, and leaderboard placement.
            </p>
            <Separator />
          </TabsContent>

          {/* COMMENTS */}
          <TabsContent value="comments">
            <HighlightedComments initialComments={highlightedComments} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-center">
          <Button
            variant="default"
            size="lg"
            className="w-full max-w-sm"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </div>
    </main>
  );
}