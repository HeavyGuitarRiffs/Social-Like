"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GoalProgressCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today’s Progress</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Metric label="Comments" value={2} goal={5} />
        <Metric label="Posts" value={1} goal={1} />
        <Metric label="Outreach" value={3} goal={5} />
      </CardContent>
    </Card>
  )
}

function Metric({
  label,
  value,
  goal,
}: {
  label: string
  value: number
  goal: number
}) {
  const progress = Math.min((value / goal) * 100, 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="opacity-70">
          {value} / {goal}
        </span>
      </div>

      <progress
        className="progress progress-primary"
        value={progress}
        max={100}
      />
    </div>
  )
}
