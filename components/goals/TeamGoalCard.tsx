"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  label: string
  completed: number
  goal: number
  daysRemaining: number
}

export default function GoalForecast({
  label,
  completed,
  goal,
  daysRemaining,
}: Props) {
  const remaining = Math.max(goal - completed, 0)
  const perDayNeeded = daysRemaining > 0 ? remaining / daysRemaining : remaining
  const progress = Math.min((completed / goal) * 100, 100)

  return (
    <Card className="bg-base-200">
      <CardHeader>
        <CardTitle>{label} Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Completed: {completed}</span>
          <span>Goal: {goal}</span>
        </div>
        <progress
          className="progress progress-secondary"
          value={progress}
          max={100}
        />
        <p className="text-xs opacity-70">
          You need <strong>{perDayNeeded.toFixed(1)}</strong> per day over the next{" "}
          {daysRemaining} days to reach your goal.
        </p>
      </CardContent>
    </Card>
  )
}
