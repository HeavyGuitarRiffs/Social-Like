"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";

import { createPortal } from "react-dom";
import { GoalColumn } from "./components/GoalColumn";
import { GoalRow } from "./components/GoalRow";
import type { GoalsPayload, Goal } from "./types";
import { saveGoals } from "./actions";

export default function GoalsPageClient(props: {
  userId: string;
  plan: string;
  initialGoals: GoalsPayload;
}) {
  const { userId, plan, initialGoals } = props;

  const [goals, setGoals] = useState<GoalsPayload>(initialGoals);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function findSection(id: string) {
    if (goals.immediate.some((g) => g.id === id)) return "immediate";
    if (goals.midterm.some((g) => g.id === id)) return "midterm";
    if (goals.longterm.some((g) => g.id === id)) return "longterm";
    return null;
  }

  function persist(updated: GoalsPayload) {
    startTransition(() => {
      void saveGoals(userId, updated);
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    const section = findSection(id);
    if (!section) return;
    const goal = goals[section].find((g) => g.id === id) || null;
    setActiveGoal(goal);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveGoal(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const from = findSection(activeId);
    const to = findSection(overId);
    if (!from || !to) return;

    const updated = structuredClone(goals);

    const fromList = updated[from];
    const toList = updated[to];

    const fromIndex = fromList.findIndex((g) => g.id === activeId);
    const toIndex = toList.findIndex((g) => g.id === overId);

    const [moved] = fromList.splice(fromIndex, 1);
    toList.splice(toIndex, 0, moved);

    setGoals(updated);
    persist(updated);
  }

  function wrapSet(section: keyof GoalsPayload) {
    return (fn: (prev: GoalsPayload) => GoalsPayload) => {
      const updated = fn(goals);
      setGoals(updated);
      persist(updated);
    };
  }

  // Correctly typed no-op for the ghost overlay
  const noopSetGoals: (fn: (prev: GoalsPayload) => GoalsPayload) => void = () => {
    // no-op for drag overlay ghost
  };

  const overlay =
    typeof window !== "undefined" && activeGoal
      ? createPortal(
          <DragOverlay>
            <GoalRow
              goal={activeGoal}
              section="immediate"
              setGoals={noopSetGoals}
              ghost={true}
            />
          </DragOverlay>,
          document.body
        )
      : null;

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-8 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground">
            Shape your next moves across immediate, midterm, and long‑term
            horizons.
          </p>
        </div>

        {isPending && (
          <span className="text-xs text-muted-foreground">Saving…</span>
        )}
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-6">
          <GoalColumn
            title="Immediate"
            section="immediate"
            goals={goals.immediate}
            setGoals={wrapSet("immediate")}
            userId={userId}
            plan={plan}
          />

          <GoalColumn
            title="Midterm"
            section="midterm"
            goals={goals.midterm}
            setGoals={wrapSet("midterm")}
            userId={userId}
            plan={plan}
          />

          <GoalColumn
            title="Long-term"
            section="longterm"
            goals={goals.longterm}
            setGoals={wrapSet("longterm")}
            userId={userId}
            plan={plan}
          />
        </div>

        {overlay}
      </DndContext>
    </div>
  );
}