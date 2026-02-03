// ReferrerBreakdown.tsx
"use client"

import React, { useMemo, useState } from "react"

type ReferrerLevel = "type" | "domain" | "path"

type ReferrerBreakdownRow = {
  referrer_type: string | null
  domain: string | null
  path: string | null
  value: number
  platform: string | null
}

type ReferrerBreakdownProps = {
  data: ReferrerBreakdownRow[]
  platforms: string[]
}

type AggregatedReferrer = {
  key: string
  label: string
  level: ReferrerLevel
  value: number
  platforms: Record<string, number>
  referrer_type?: string | null
  domain?: string | null
  path?: string | null
}

export function ReferrerBreakdownComponent({
  data,
  platforms,
}: ReferrerBreakdownProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["total"])
  const [level, setLevel] = useState<ReferrerLevel>("type")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  const filteredByPlatform = useMemo(() => {
    if (selectedPlatforms.includes("total")) return data
    return data.filter(
      row => row.platform && selectedPlatforms.includes(row.platform),
    )
  }, [data, selectedPlatforms])

  const aggregated = useMemo<AggregatedReferrer[]>(() => {
    const map = new Map<string, AggregatedReferrer>()

    const pushRow = (
      key: string,
      label: string,
      lvl: ReferrerLevel,
      row: ReferrerBreakdownRow,
      meta: { referrer_type?: string | null; domain?: string | null; path?: string | null },
    ) => {
      const platformKey = row.platform ?? "total"
      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          key,
          label,
          level: lvl,
          value: row.value,
          platforms: { [platformKey]: row.value },
          ...meta,
        })
      } else {
        existing.value += row.value
        existing.platforms[platformKey] =
          (existing.platforms[platformKey] ?? 0) + row.value
      }
    }

    for (const row of filteredByPlatform) {
      const typeLabel = normalizeReferrerType(row.referrer_type)

      if (level === "type") {
        pushRow(
          `type:${typeLabel}`,
          typeLabel,
          "type",
          row,
          { referrer_type: typeLabel },
        )
      } else if (level === "domain") {
        if (selectedType && normalizeReferrerType(row.referrer_type) !== selectedType) continue
        const domainLabel = row.domain ?? "Unknown domain"
        pushRow(
          `domain:${selectedType}:${domainLabel}`,
          domainLabel,
          "domain",
          row,
          { referrer_type: selectedType, domain: row.domain },
        )
      } else if (level === "path") {
        if (selectedType && normalizeReferrerType(row.referrer_type) !== selectedType) continue
        if (selectedDomain && row.domain !== selectedDomain) continue
        const pathLabel = row.path ?? "Unknown path"
        pushRow(
          `path:${selectedType}:${selectedDomain}:${pathLabel}`,
          pathLabel,
          "path",
          row,
          { referrer_type: selectedType, domain: selectedDomain, path: row.path },
        )
      }
    }

    return Array.from(map.values()).sort((a, b) => b.value - a.value)
  }, [filteredByPlatform, level, selectedType, selectedDomain])

  const topReferrers = useMemo<AggregatedReferrer[]>(() => {
    const map = new Map<string, AggregatedReferrer>()

    for (const row of filteredByPlatform) {
      const typeLabel = normalizeReferrerType(row.referrer_type)
      const domainLabel = row.domain ?? "Unknown domain"
      const label = `${typeLabel} · ${domainLabel}`
      const key = `top:${typeLabel}:${domainLabel}`
      const platformKey = row.platform ?? "total"

      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          key,
          label,
          level: "domain",
          value: row.value,
          platforms: { [platformKey]: row.value },
          referrer_type: typeLabel,
          domain: row.domain,
        })
      } else {
        existing.value += row.value
        existing.platforms[platformKey] =
          (existing.platforms[platformKey] ?? 0) + row.value
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [filteredByPlatform])

  const handleDrill = (item: AggregatedReferrer) => {
    if (item.level === "type") {
      setSelectedType(item.referrer_type ?? null)
      setSelectedDomain(null)
      setLevel("domain")
    } else if (item.level === "domain") {
      setSelectedDomain(item.domain ?? null)
      setLevel("path")
    }
  }

  const handleBreadcrumbClick = (target: ReferrerLevel) => {
    setLevel(target)
    if (target === "type") {
      setSelectedType(null)
      setSelectedDomain(null)
    } else if (target === "domain") {
      setSelectedDomain(null)
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            Referrer breakdown
          </h2>
          <p className="text-xs text-neutral-500">
            Referrer type → domain → path, with platform-aware drilldowns.
          </p>
        </div>
        <TopReferrersMiniCard items={topReferrers} />
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <PlatformMultiToggle
          platforms={platforms}
          selected={selectedPlatforms}
          onChange={setSelectedPlatforms}
        />
        <ReferrerBreadcrumb
          level={level}
          type={selectedType}
          domain={selectedDomain}
          onClick={handleBreadcrumbClick}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReferrerGrid items={aggregated} level={level} onDrill={handleDrill} />
        <ReferrerTable items={aggregated} onDrill={handleDrill} />
      </div>
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

type ReferrerBreadcrumbProps = {
  level: ReferrerLevel
  type: string | null
  domain: string | null
  onClick: (level: ReferrerLevel) => void
}

function ReferrerBreadcrumb({
  level,
  type,
  domain,
  onClick,
}: ReferrerBreadcrumbProps) {
  const itemClass = (active: boolean) =>
    `cursor-pointer text-xs ${
      active
        ? "font-semibold text-neutral-900"
        : "text-neutral-500 hover:text-neutral-800"
    }`

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <span
        className={itemClass(level === "type")}
        onClick={() => onClick("type")}
      >
        {type ?? "Referrer type"}
      </span>
      <span className="text-neutral-400">/</span>
      <span
        className={itemClass(level === "domain")}
        onClick={() => onClick("domain")}
      >
        {domain ?? "Domain"}
      </span>
      <span className="text-neutral-400">/</span>
      <span className={itemClass(level === "path")}>Path</span>
    </div>
  )
}

/* ---------- GRID + TABLE + MINI CARD ---------- */

type ReferrerGridProps = {
  level: ReferrerLevel
  items: AggregatedReferrer[]
  onDrill: (item: AggregatedReferrer) => void
}

function ReferrerGrid({ level, items, onDrill }: ReferrerGridProps) {
  return (
    <div className="relative h-72 w-full rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-700">
          Referrer view · {referrerLevelLabel(level)}
        </span>
        <span className="text-[10px] text-neutral-500">
          Click a row to drill down
        </span>
      </div>
      <div className="flex h-[calc(100%-1.5rem)] flex-wrap content-start gap-2 overflow-auto">
        {items.length === 0 && (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
            No data for this level.
          </div>
        )}
        {items.map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => onDrill(item)}
            title={platformTooltip(item.platforms)}
            className="flex min-w-[110px] flex-col rounded-md border border-neutral-200 bg-white px-2 py-1 text-left text-[11px] shadow-sm hover:border-neutral-400"
          >
            <span className="truncate font-medium text-neutral-800">
              {item.label}
            </span>
            <span className="text-[10px] text-neutral-500">
              {item.value.toLocaleString()} total
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

type ReferrerTableProps = {
  items: AggregatedReferrer[]
  onDrill: (item: AggregatedReferrer) => void
}

function ReferrerTable({ items, onDrill }: ReferrerTableProps) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-md border border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700">
        Ranked referrers
      </div>
      <div className="h-[calc(100%-2rem)] overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-neutral-100 text-[11px] text-neutral-500">
              <th className="px-3 py-2 text-left font-normal">Item</th>
              <th className="px-3 py-2 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-3 py-4 text-center text-[11px] text-neutral-400"
                >
                  No data for this level.
                </td>
              </tr>
            )}
            {items.map(item => (
              <tr
                key={item.key}
                className="cursor-pointer border-b border-neutral-50 hover:bg-neutral-50"
                onClick={() => onDrill(item)}
                title={platformTooltip(item.platforms)}
              >
                <td className="px-3 py-2 align-middle">
                  <div className="flex flex-col">
                    <span className="truncate text-[11px] font-medium text-neutral-800">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {referrerLevelLabel(item.level)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right align-middle text-[11px] font-semibold text-neutral-800">
                  {item.value.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type TopReferrersMiniCardProps = {
  items: AggregatedReferrer[]
}

function TopReferrersMiniCard({ items }: TopReferrersMiniCardProps) {
  return (
    <div className="w-48 rounded-md border border-neutral-200 bg-neutral-50 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-neutral-700">
          Top 5 referrers
        </span>
      </div>
      <div className="space-y-1">
        {items.length === 0 && (
          <div className="py-2 text-[10px] text-neutral-400">
            No referrer data yet.
          </div>
        )}
        {items.map((item, index) => (
          <div
            key={item.key}
            className="flex items-center justify-between text-[10px]"
            title={platformTooltip(item.platforms)}
          >
            <span className="truncate text-neutral-700">
              {index + 1}. {item.label}
            </span>
            <span className="font-semibold text-neutral-900">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- HELPERS ---------- */

function normalizeReferrerType(raw: string | null): string {
  if (!raw) return "Unknown"
  const v = raw.toLowerCase().trim()

  if (v.includes("instagram") || v.includes("facebook") || v.includes("tiktok") || v.includes("social")) {
    return "Social"
  }
  if (v.includes("google") || v.includes("bing") || v.includes("search")) {
    return "Search"
  }
  if (v.includes("email") || v.includes("newsletter")) {
    return "Email"
  }
  if (v.includes("direct")) {
    return "Direct"
  }
  return capitalize(raw)
}

function referrerLevelLabel(level: ReferrerLevel): string {
  if (level === "type") return "Referrer type"
  if (level === "domain") return "Domain"
  return "Path"
}

function platformTooltip(platforms: Record<string, number>): string {
  const entries = Object.entries(platforms)
  if (entries.length === 0) return ""
  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([platform, value]) => `${platform}: ${value.toLocaleString()}`)
    .join(" • ")
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}