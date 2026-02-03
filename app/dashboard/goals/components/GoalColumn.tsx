"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Goal, GoalsPayload } from "../types";
import { GoalRow } from "./GoalRow";

export function GoalColumn({
  title,
  section,
  goals,
  setGoals,
  userId,
  plan,
}: {
  title: string;
  section: keyof GoalsPayload;
  goals: Goal[];
  setGoals: (fn: (prev: GoalsPayload) => GoalsPayload) => void;
  userId: string;
  plan: string; // "free" | "pro" | "elite" | "unlimited"
}) {
  // ---------------------------------------------------------
  // PLAN LIMIT LOGIC
  // ---------------------------------------------------------

  // You are the ONLY free user
  const JUSTIN_ID = "YOUR_USER_ID_HERE"; // replace with your UUID

  const isFreeUser = userId === JUSTIN_ID || plan === "free";

  // Free users get 10 goals per section
  const limit = isFreeUser ? 10 : Infinity;

  const handleAdd = () => {
    if (goals.length >= limit) return;

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      text: "",
      completed: false,
      progress: 0,
      target: 100,
      due: null,
    };

    setGoals((prev) => ({
      ...prev,
      [section]: [...prev[section], newGoal],
    }));
  };

  return (
    <Card className="border bg-card/80 backdrop-blur-sm shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>

        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={goals.length >= limit}
        >
          {goals.length >= limit ? "Limit Reached" : "Add"}
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {goals.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No goals yet. Add your first one.
          </p>
        )}

        {goals.map((goal) => (
          <GoalRow
            key={goal.id}
            goal={goal}
            section={section}
            setGoals={setGoals}
          />
        ))}
      </CardContent>
    </Card>
  );
}