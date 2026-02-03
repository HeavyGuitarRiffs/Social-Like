"use client";

import { ComponentType } from "react";

export interface StatCardData {
  platform: string;
  percent: string;
  postsToday: number;
  commentsToday: number;
  totalPosts?: number;
  totalComments?: number;
  Icon?: ComponentType<{ className?: string }>;
}

interface StatCardProps {
  data: StatCardData;
  variant?: "toast" | "dashboard";
}

export default function StatCard({
  data,
  variant = "toast",
}: StatCardProps) {
  const Icon = data.Icon;

  return (
    <div
      className={`
        rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md
        ${variant === "toast" ? "w-[360px] p-6 shadow-xl" : "w-full p-8"}
      `}
    >
      <div className="flex justify-between gap-6 items-start">
        {/* LEFT SIDE */}
        <div className="flex flex-col">
          {Icon && (
            <Icon className="text-4xl mb-3 text-primary" />
          )}

          <h3 className="text-3xl font-extrabold leading-tight">
            {data.platform}
          </h3>

          <p className="text-sm opacity-70 mt-1">
            Posts today: {data.postsToday}
          </p>

          <p className="text-sm opacity-70">
            Comments today: {data.commentsToday}
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-end text-right">
          <p className="text-5xl font-extrabold text-secondary">
            {data.percent}
          </p>

          {data.totalPosts !== undefined && (
            <p className="text-xs opacity-60 mt-2">
              Total posts: {data.totalPosts.toLocaleString()}
            </p>
          )}

          {data.totalComments !== undefined && (
            <p className="text-xs opacity-60">
              Total comments: {data.totalComments.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
