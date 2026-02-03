"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Instagram,
  Youtube,
  Twitter,
  Globe,
  TrendingUp,
  Zap,
  Flame,
} from "lucide-react";

interface PublicProfileCardProps {
  avatarUrl: string;
  name: string;
  username: string;
  socialPower: number;
  streakDays: number;
  commentVelocity: number; // daily or weekly
  replySpeed: number; // multiplier
  growthPercent: number;
  monetizationReady: boolean;
  links?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
  };
}

export default function PublicProfileCard({
  avatarUrl,
  name,
  username,
  socialPower,
  streakDays,
  commentVelocity,
  replySpeed,
  growthPercent,
  monetizationReady,
  links = {},
}: PublicProfileCardProps) {
  return (
    <Card className="w-full max-w-sm bg-base-200 border border-base-300 shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <Image
            src={avatarUrl}
            alt={name}
            width={64}
            height={64}
            className="rounded-full border border-base-300"
          />

          <div>
            <p className="text-xl font-bold">{name}</p>
            <p className="text-sm opacity-70">@{username}</p>
          </div>
        </div>

        {/* Social Power */}
        <div className="text-center">
          <p className="text-4xl font-extrabold text-primary tabular-nums">
            {socialPower.toLocaleString()}
          </p>
          <p className="text-sm opacity-70">Social Power</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-secondary">
              {commentVelocity}
            </p>
            <p className="text-xs opacity-70">Velocity</p>
          </div>

          <div>
            <p className="text-lg font-bold text-accent">{replySpeed}×</p>
            <p className="text-xs opacity-70">Reply Speed</p>
          </div>

          <div>
            <p className="text-lg font-bold text-success">
              +{growthPercent}%
            </p>
            <p className="text-xs opacity-70">Growth</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge className="flex items-center gap-1 bg-primary text-primary-content">
            <Flame size={14} />
            {streakDays}‑day streak
          </Badge>

          {monetizationReady ? (
            <Badge className="bg-success text-success-content">
              Monetization Ready
            </Badge>
          ) : (
            <Badge className="bg-base-300 text-base-content">
              Growing Creator
            </Badge>
          )}
        </div>

        {/* Social Links */}
        <div className="flex gap-4">
          {links.instagram && (
            <Link href={links.instagram} target="_blank">
              <Instagram className="w-5 h-5 opacity-70 hover:opacity-100 transition" />
            </Link>
          )}
          {links.youtube && (
            <Link href={links.youtube} target="_blank">
              <Youtube className="w-5 h-5 opacity-70 hover:opacity-100 transition" />
            </Link>
          )}
          {links.twitter && (
            <Link href={links.twitter} target="_blank">
              <Twitter className="w-5 h-5 opacity-70 hover:opacity-100 transition" />
            </Link>
          )}
          {links.website && (
            <Link href={links.website} target="_blank">
              <Globe className="w-5 h-5 opacity-70 hover:opacity-100 transition" />
            </Link>
          )}
        </div>

        {/* CTA */}
        <Button className="w-full btn-primary">Follow</Button>
      </CardContent>
    </Card>
  );
}