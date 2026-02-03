"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, Calendar, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Goal, GoalsPayload } from "../types";

export function GoalRow({
  goal,
  section,
  setGoals,
  ghost = false,
}: {
  goal: Goal;
  section: keyof GoalsPayload;
  setGoals: (fn: (prev: GoalsPayload) => GoalsPayload) => void;
  ghost?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: goal.id });

  const [open, setOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const style = ghost
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  // 🔥 Auto-expand textarea on every render (keeps it big permanently)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [goal.text]);

  const updateGoal = (updates: Partial<Goal>) => {
    setGoals((prev) => ({
      ...prev,
      [section]: prev[section].map((g) =>
        g.id === goal.id ? { ...g, ...updates } : g
      ),
    }));
  };

  const handleDelete = () => {
    setGoals((prev) => ({
      ...prev,
      [section]: prev[section].filter((g) => g.id !== goal.id),
    }));
  };

  const progressPercent =
    goal.target > 0 ? Math.min(100, Math.round((goal.progress / goal.target) * 100)) : 0;

  const dueLabel = goal.due
    ? new Date(goal.due).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <>
      <div
        ref={ghost ? undefined : setNodeRef}
        style={style}
        className={[
          "flex flex-col gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-sm cursor-pointer",
          isDragging && !ghost ? "shadow-lg ring-2 ring-primary/40 scale-[1.01]" : "",
          ghost ? "opacity-80 shadow-lg border-dashed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => !ghost && setOpen(true)}
      >
        <div className="flex items-start gap-2">
          {!ghost && (
            <button
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab text-muted-foreground hover:text-foreground select-none"
              onClick={(e) => e.stopPropagation()}
            >
              ⠿
            </button>
          )}

          <div className="flex-1 flex flex-col gap-1">
            {/* 🔥 Textarea stays expanded forever */}
            <textarea
              ref={textareaRef}
              value={goal.text}
              onChange={(e) => updateGoal({ text: e.target.value })}
              placeholder="Describe this goal..."
              className="w-full resize-none bg-transparent outline-none text-sm leading-tight"
              rows={1}
              style={{ overflow: "hidden" }} // no shrinking
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 flex items-center gap-2">
                <Progress value={progressPercent} className="h-1.5 flex-1" />
                <span className="text-[10px] text-muted-foreground">
                  {progressPercent}%
                </span>
              </div>

              {dueLabel && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Due {dueLabel}
                </Badge>
              )}
            </div>
          </div>

          {!ghost && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="mt-1 text-muted-foreground hover:text-red-500"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Goal Detail Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground">Goal</label>
              <textarea
                className="w-full border rounded-md p-2 text-sm resize-none"
                rows={3}
                value={goal.text}
                onChange={(e) => updateGoal({ text: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target size={12} /> Progress
                </label>
                <input
                  type="number"
                  className="border rounded-md p-1 text-sm"
                  value={goal.progress}
                  onChange={(e) => updateGoal({ progress: Number(e.target.value) })}
                />
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-muted-foreground">Target</label>
                <input
                  type="number"
                  className="border rounded-md p-1 text-sm"
                  value={goal.target}
                  onChange={(e) => updateGoal({ target: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar size={12} /> Due Date
              </label>
              <input
                type="date"
                className="border rounded-md p-1 text-sm"
                value={goal.due ?? ""}
                onChange={(e) => updateGoal({ due: e.target.value || null })}
              />
            </div>

            <Button onClick={() => setOpen(false)} className="mt-2">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}