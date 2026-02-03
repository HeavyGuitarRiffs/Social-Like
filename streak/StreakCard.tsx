"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FreezeModal from "./FreezeModal";

interface StreakModalProps {
  open: boolean;
  onClose: () => void;
  streakDays: number;
  commentsDone: number;
  goal: number;
}

export default function StreakModal({
  open,
  onClose,
  streakDays,
  commentsDone,
  goal,
}: StreakModalProps) {
  const [freezeOpen, setFreezeOpen] = useState(false);
  const remaining = goal - commentsDone;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Your Daily Streak</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <p className="text-4xl font-bold">{streakDays} days</p>
              <p className="opacity-70">Current streak</p>
            </div>

            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    commentsDone >= i
                      ? "bg-success text-success-content"
                      : "bg-base-300 opacity-50"
                  }`}
                >
                  {commentsDone >= i ? "✓" : i}
                </div>
              ))}
            </div>

            <p className="text-sm opacity-70">
              {commentsDone} / {goal} comments today
            </p>

            {remaining > 0 && (
              <p className="text-sm font-medium text-warning">
                {remaining} more to keep your streak alive
              </p>
            )}

            <button
              onClick={() => setFreezeOpen(true)}
              className="btn btn-primary w-full"
            >
              Freeze Streak
            </button>
          </div>cannot find name div
        </DialogContent>
      </Dialog>

      <FreezeModal
        open={freezeOpen}
        onClose={() => setFreezeOpen(false)}
        streakDays={streakDays}
      />
    </>
  );
}