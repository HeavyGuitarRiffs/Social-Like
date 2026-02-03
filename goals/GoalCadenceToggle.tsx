"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Cadence = "daily" | "weekly" | "monthly"

type Props = {
  value: Cadence
  onChange: (value: Cadence) => void
}

export default function GoalCadenceToggle({ value, onChange }: Props) {
  const options: Cadence[] = ["daily", "weekly", "monthly"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Cadence</CardTitle>
        <p className="text-sm opacity-70">
          How often should Qubit track this goal?
        </p>
      </CardHeader>

      <CardContent className="flex gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`btn flex-1 ${
              value === opt
                ? "btn-primary"
                : "btn-outline btn-primary"
            }`}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
