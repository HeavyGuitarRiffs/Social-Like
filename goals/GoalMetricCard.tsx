"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type GoalMetricCardProps = {
  title: string
  description: string
  value: number
  onChange: (value: number) => void
}

export default function GoalMetricCard({
  title,
  description,
  value,
  onChange,
}: GoalMetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm opacity-70">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <input
          type="range"
          min={0}
          max={20}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range range-primary"
        />

        <div className="flex justify-between text-sm">
          <span>0</span>
          <span className="font-semibold text-primary">
            {value} / day
          </span>
          <span>20+</span>
        </div>
      </CardContent>
    </Card>
  )
}
