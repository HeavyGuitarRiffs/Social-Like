"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface FreezeModalProps {
  open: boolean;
  onClose: () => void;
  streakDays: number;
}

export default function FreezeModal({
  open,
  onClose,
  streakDays,
}: FreezeModalProps) {
  const [loading, setLoading] = useState(false);
  const [frozen, setFrozen] = useState(false);

  async function handleFreeze() {
    setLoading(true);

    const { error } = await supabase
      .from("streak_freezes")
      .insert({
        frozen_at: new Date().toISOString(),
        streak_days: streakDays,
      });

    setLoading(false);

    if (!error) {
      setFrozen(true);
      setTimeout(() => onClose(), 1200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Freeze Your Streak</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!frozen ? (
            <>
              <p className="opacity-70 text-sm">
                Freezing protects your streak for today even if you don’t hit your comment goal.
              </p>

              <Button
                onClick={handleFreeze}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Freezing..." : "Confirm Freeze"}
              </Button>
            </>
          ) : (
            <p className="text-success font-medium text-center">
              Streak frozen for today!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}