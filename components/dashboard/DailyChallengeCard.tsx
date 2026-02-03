"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DailyChallengeProps = {
  completed?: number
  goal?: number
}

export default function DailyChallengeCard({
  completed = 1,
  goal = 3,
}: DailyChallengeProps) {
  const progress = Math.min((completed / goal) * 100, 100)
  const isComplete = completed >= goal

  return (
    <Card className="border-primary/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Daily Challenge
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* COPY */}
        <p className="text-sm opacity-80">
          Reply to <span className="font-semibold">{goal}</span> comments today
          to keep your streak alive.
        </p>

        {/* PROGRESS */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs opacity-70">
            <span>
              {completed} / {goal} completed
            </span>
            {isComplete && <span className="text-success">Completed</span>}
          </div>

          <progress
            className="progress progress-primary"
            value={progress}
            max={100}
          />
        </div>

        {/* CTA */}
        {isComplete ? (
          <div className="rounded-lg bg-success/20 text-success text-sm p-3 text-center">
            ✅ Challenge complete — streak secured
          </div>
        ) : (
          <button className="btn btn-primary w-full">
            Reply to comments →
          </button>
        )}
      </CardContent>
    </Card>
  )
}
