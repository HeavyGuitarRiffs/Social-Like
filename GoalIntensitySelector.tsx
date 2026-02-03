"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Intensity = "casual" | "consistent" | "aggressive"

type Props = {
  value: Intensity
  onChange: (value: Intensity) => void
}

export default function GoalIntensitySelector({
  value,
  onChange,
}: Props) {
  const options: {
    key: Intensity
    label: string
    desc: string
  }[] = [
    {
      key: "casual",
      label: "Casual",
      desc: "Low pressure · Easy streaks",
    },
    {
      key: "consistent",
      label: "Consistent",
      desc: "Balanced growth · Default",
    },
    {
      key: "aggressive",
      label: "Aggressive",
      desc: "High output · Faster rewards",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intensity</CardTitle>
        <p className="text-sm opacity-70">
          This affects streak difficulty & rewards
        </p>
      </CardHeader>

      <CardContent className="grid md:grid-cols-3 gap-4">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`card p-4 text-left transition ${
              value === opt.key
                ? "border-primary border-2"
                : "border border-base-300"
            }`}
          >
            <h3 className="font-semibold">{opt.label}</h3>
            <p className="text-xs opacity-70 mt-1">
              {opt.desc}
            </p>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
