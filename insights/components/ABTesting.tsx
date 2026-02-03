// ABTesting.tsx
"use client"

import React, { useMemo, useState } from "react"

type ABVariantId = string

type ABTestResultRow = {
  experiment_id: string
  experiment_name: string
  variant_id: ABVariantId
  variant_label: string // "A", "B", "Thumbnail 1", etc.
  metric_key: string    // "ctr", "conversion_rate", "watch_time", etc.
  metric_label: string  // "Click-through rate", "Conversion rate", etc.
  value: number         // numeric metric value (already normalized)
  platform: string | null
}

type ABTestingProps = {
  data: ABTestResultRow[]
  platforms: string[]
}

type ExperimentOption = {
  experiment_id: string
  experiment_name: string
}

type MetricOption = {
  metric_key: string
  metric_label: string
}

type VariantAggregate = {
  variant_id: ABVariantId
  variant_label: string
  value: number
}

export function ABTestingComponent({ data, platforms }: ABTestingProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["total"])

  const experiments = useMemo<ExperimentOption[]>(() => {
    const map = new Map<string, string>()
    for (const row of data) {
      if (!map.has(row.experiment_id)) {
        map.set(row.experiment_id, row.experiment_name)
      }
    }
    return Array.from(map.entries()).map(([experiment_id, experiment_name]) => ({
      experiment_id,
      experiment_name,
    }))
  }, [data])

  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(
    () => (experiments[0]?.experiment_id ?? null),
  )

  const metrics = useMemo<MetricOption[]>(() => {
    if (!selectedExperimentId) return []
    const map = new Map<string, string>()
    for (const row of data) {
      if (row.experiment_id !== selectedExperimentId) continue
      if (!map.has(row.metric_key)) {
        map.set(row.metric_key, row.metric_label)
      }
    }
    return Array.from(map.entries()).map(([metric_key, metric_label]) => ({
      metric_key,
      metric_label,
    }))
  }, [data, selectedExperimentId])

  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(
    () => (metrics[0]?.metric_key ?? null),
  )

  React.useEffect(() => {
    if (!selectedExperimentId && experiments.length > 0) {
      setSelectedExperimentId(experiments[0].experiment_id)
    }
  }, [experiments, selectedExperimentId])

  React.useEffect(() => {
    if (!selectedMetricKey && metrics.length > 0) {
      setSelectedMetricKey(metrics[0].metric_key)
    }
  }, [metrics, selectedMetricKey])

  const filtered = useMemo(() => {
    return data.filter(row => {
      if (!selectedExperimentId || !selectedMetricKey) return false
      if (row.experiment_id !== selectedExperimentId) return false
      if (row.metric_key !== selectedMetricKey) return false
      if (selectedPlatforms.includes("total")) return true
      return row.platform && selectedPlatforms.includes(row.platform)
    })
  }, [data, selectedExperimentId, selectedMetricKey, selectedPlatforms])

  const variants = useMemo<VariantAggregate[]>(() => {
    const map = new Map<ABVariantId, VariantAggregate>()
    for (const row of filtered) {
      const existing = map.get(row.variant_id)
      if (!existing) {
        map.set(row.variant_id, {
          variant_id: row.variant_id,
          variant_label: row.variant_label,
          value: row.value,
        })
      } else {
        existing.value += row.value
      }
    }
    return Array.from(map.values()).sort((a, b) => b.value - a.value)
  }, [filtered])

  const winner = variants[0] ?? null
  const baseline = variants[1] ?? null

  const lift = useMemo(() => {
    if (!winner || !baseline) return null
    if (baseline.value === 0) return null
    const diff = winner.value - baseline.value
    return (diff / baseline.value) * 100
  }, [winner, baseline])

  const selectedExperimentName = useMemo(() => {
    if (!selectedExperimentId) return ""
    return (
      experiments.find(e => e.experiment_id === selectedExperimentId)
        ?.experiment_name ?? ""
    )
  }, [experiments, selectedExperimentId])

  const selectedMetricLabel = useMemo(() => {
    if (!selectedMetricKey) return ""
    return metrics.find(m => m.metric_key === selectedMetricKey)?.metric_label ?? ""
  }, [metrics, selectedMetricKey])

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            A/B test results
          </h2>
          <p className="text-xs text-neutral-500">
            Compare variants for a single experiment and metric, with platform-aware filtering.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-xs md:items-end">
          <ExperimentSelect
            experiments={experiments}
            selectedExperimentId={selectedExperimentId}
            onChange={setSelectedExperimentId}
          />
          <MetricSelect
            metrics={metrics}
            selectedMetricKey={selectedMetricKey}
            onChange={setSelectedMetricKey}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <PlatformMultiToggle
          platforms={platforms}
          selected={selectedPlatforms}
          onChange={setSelectedPlatforms}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          label="Experiment"
          value={selectedExperimentName || "No experiment selected"}
        />
        <SummaryCard
          label="Metric"
          value={selectedMetricLabel || "No metric selected"}
        />
        <SummaryCard
          label="Winning variant"
          value={winner ? winner.variant_label : "Not enough data"}
          helper={
            winner && baseline && lift !== null
              ? `~${lift.toFixed(1)}% lift vs ${baseline.variant_label}`
              : undefined
          }
        />
      </div>

      <VariantTable variants={variants} metricLabel={selectedMetricLabel} />
    </Card>
  )
}

/* ---------- PRIMITIVES ---------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      {children}
    </div>
  )
}

type PlatformMultiToggleProps = {
  platforms: string[]
  selected: string[]
  onChange: (next: string[]) => void
}

function PlatformMultiToggle({
  platforms,
  selected,
  onChange,
}: PlatformMultiToggleProps) {
  const allOptions = ["total", ...platforms]

  const toggle = (value: string) => {
    if (value === "total") {
      onChange(["total"])
      return
    }
    const withoutTotal = selected.filter(s => s !== "total")
    if (withoutTotal.includes(value)) {
      const next = withoutTotal.filter(s => s !== value)
      onChange(next.length === 0 ? ["total"] : next)
    } else {
      onChange([...withoutTotal, value])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allOptions.map(option => {
        const isActive = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              isActive
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400"
            }`}
          >
            {option === "total" ? "Total" : option}
          </button>
        )
      })}
    </div>
  )
}

type ExperimentSelectProps = {
  experiments: ExperimentOption[]
  selectedExperimentId: string | null
  onChange: (id: string | null) => void
}

function ExperimentSelect({
  experiments,
  selectedExperimentId,
  onChange,
}: ExperimentSelectProps) {
  return (
    <div className="flex flex-col items-start gap-1 md:items-end">
      <span className="text-[11px] font-medium text-neutral-600">
        Experiment
      </span>
      <select
        className="w-56 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 shadow-sm focus:border-neutral-400 focus:outline-none"
        value={selectedExperimentId ?? ""}
        onChange={e => onChange(e.target.value || null)}
      >
        {experiments.length === 0 && (
          <option value="">No experiments</option>
        )}
        {experiments.map(exp => (
          <option key={exp.experiment_id} value={exp.experiment_id}>
            {exp.experiment_name}
          </option>
        ))}
      </select>
    </div>
  )
}

type MetricSelectProps = {
  metrics: MetricOption[]
  selectedMetricKey: string | null
  onChange: (key: string | null) => void
}

function MetricSelect({
  metrics,
  selectedMetricKey,
  onChange,
}: MetricSelectProps) {
  return (
    <div className="flex flex-col items-start gap-1 md:items-end">
      <span className="text-[11px] font-medium text-neutral-600">
        Metric
      </span>
      <select
        className="w-56 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 shadow-sm focus:border-neutral-400 focus:outline-none"
        value={selectedMetricKey ?? ""}
        onChange={e => onChange(e.target.value || null)}
      >
        {metrics.length === 0 && (
          <option value="">No metrics</option>
        )}
        {metrics.map(metric => (
          <option key={metric.metric_key} value={metric.metric_key}>
            {metric.metric_label}
          </option>
        ))}
      </select>
    </div>
  )
}

type SummaryCardProps = {
  label: string
  value: string
  helper?: string
}

function SummaryCard({ label, value, helper }: SummaryCardProps) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div className="text-[11px] font-medium text-neutral-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-neutral-900">
        {value}
      </div>
      {helper && (
        <div className="mt-1 text-[11px] text-neutral-500">
          {helper}
        </div>
      )}
    </div>
  )
}

type VariantTableProps = {
  variants: VariantAggregate[]
  metricLabel: string
}

function VariantTable({ variants, metricLabel }: VariantTableProps) {
  return (
    <div className="mt-2 w-full overflow-hidden rounded-md border border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700">
        Variant performance
      </div>
      <div className="max-h-72 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-neutral-100 text-[11px] text-neutral-500">
              <th className="px-3 py-2 text-left font-normal">Variant</th>
              <th className="px-3 py-2 text-right font-normal">
                {metricLabel || "Value"}
              </th>
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-3 py-4 text-center text-[11px] text-neutral-400"
                >
                  No data for this experiment and metric.
                </td>
              </tr>
            )}
            {variants.map(variant => (
              <tr
                key={variant.variant_id}
                className="border-b border-neutral-50"
              >
                <td className="px-3 py-2 align-middle">
                  <span className="text-[11px] font-medium text-neutral-800">
                    {variant.variant_label}
                  </span>
                </td>
                <td className="px-3 py-2 text-right align-middle text-[11px] font-semibold text-neutral-800">
                  {variant.value.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}