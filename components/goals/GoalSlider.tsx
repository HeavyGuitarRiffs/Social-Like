"use client"

import * as React from "react"
import { Slider, SliderTrack, SliderRange, SliderThumb } from "@/components/ui/slider"

type GoalSliderProps = {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}

export default function GoalSlider({
  label,
  value,
  min = 0,
  max = 50,
  step = 1,
  onChange,
}: GoalSliderProps) {
  return (
    <div className="space-y-2">
      {/* Label + Value */}
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{value}</span>
      </div>

      {/* Slider */}
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(val) => onChange(val[0])}
      >
        <SliderTrack className="bg-base-300 h-2 rounded-full">
          <SliderRange className="bg-primary h-2 rounded-full" />
        </SliderTrack>
        <SliderThumb className="w-5 h-5 bg-primary shadow-md" />
      </Slider>
    </div>
  )
}
