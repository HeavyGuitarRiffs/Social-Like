// GeoBreakdownComponent.tsx
"use client"

import React, { useMemo, useState } from "react"

type GeoLevel = "world" | "continent" | "country" | "region" | "city"

type GeoBreakdownRow = {
  continent: string | null
  country: string | null
  region: string | null
  city: string | null
  value: number
  platform: string | null // null = total
}

type GeoBreakdownProps = {
  data: GeoBreakdownRow[]
  platforms: string[]
}

type AggregatedLocation = {
  key: string
  label: string
  level: GeoLevel
  value: number
  platforms: Record<string, number>
}

export function GeoBreakdownComponent({ data, platforms }: GeoBreakdownProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["total"])
  const [level, setLevel] = useState<GeoLevel>("world")
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const filteredByPlatform = useMemo(() => {
    if (selectedPlatforms.includes("total")) {
      return data
    }
    return data.filter(
      row => row.platform && selectedPlatforms.includes(row.platform),
    )
  }, [data, selectedPlatforms])

  const aggregated = useMemo<AggregatedLocation[]>(() => {
    const map = new Map<string, AggregatedLocation>()

    const pushRow = (
      key: string,
      label: string,
      lvl: GeoLevel,
      row: GeoBreakdownRow,
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
        })
      } else {
        existing.value += row.value
        existing.platforms[platformKey] =
          (existing.platforms[platformKey] ?? 0) + row.value
      }
    }

    for (const row of filteredByPlatform) {
      if (level === "world") {
        pushRow("world", "World", "world", row)
      } else if (level === "continent") {
        const label = row.continent ?? "Unknown"
        pushRow(`continent:${label}`, label, "continent", row)
      } else if (level === "country") {
        if (selectedContinent && row.continent !== selectedContinent) continue
        const label = row.country ?? "Unknown"
        pushRow(`country:${label}`, label, "country", row)
      } else if (level === "region") {
        if (selectedCountry && row.country !== selectedCountry) continue
        const label = row.region ?? "Unknown"
        pushRow(`region:${label}`, label, "region", row)
      } else if (level === "city") {
        if (selectedRegion && row.region !== selectedRegion) continue
        const label = row.city ?? "Unknown"
        pushRow(`city:${label}`, label, "city", row)
      }
    }

    return Array.from(map.values()).sort((a, b) => b.value - a.value)
  }, [
    filteredByPlatform,
    level,
    selectedContinent,
    selectedCountry,
    selectedRegion,
  ])

  const top5Countries = useMemo<AggregatedLocation[]>(() => {
    const map = new Map<string, AggregatedLocation>()

    for (const row of filteredByPlatform) {
      const label = row.country ?? "Unknown"
      const key = `country:${label}`
      const platformKey = row.platform ?? "total"
      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          key,
          label,
          level: "country",
          value: row.value,
          platforms: { [platformKey]: row.value },
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

  const handleDrill = (item: AggregatedLocation) => {
    if (item.level === "world") {
      setLevel("continent")
      setSelectedContinent(null)
      setSelectedCountry(null)
      setSelectedRegion(null)
    } else if (item.level === "continent") {
      setLevel("country")
      setSelectedContinent(item.label === "Unknown" ? null : item.label)
      setSelectedCountry(null)
      setSelectedRegion(null)
    } else if (item.level === "country") {
      setLevel("region")
      setSelectedCountry(item.label === "Unknown" ? null : item.label)
      setSelectedRegion(null)
    } else if (item.level === "region") {
      setLevel("city")
      setSelectedRegion(item.label === "Unknown" ? null : item.label)
    }
  }

  const handleBreadcrumbClick = (target: GeoLevel) => {
    setLevel(target)
    if (target === "world") {
      setSelectedContinent(null)
      setSelectedCountry(null)
      setSelectedRegion(null)
    } else if (target === "continent") {
      setSelectedCountry(null)
      setSelectedRegion(null)
    } else if (target === "country") {
      setSelectedRegion(null)
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            Geographic breakdown
          </h2>
          <p className="text-xs text-neutral-500">
            World → continent → country → region → city, with platform-aware
            drilldowns.
          </p>
        </div>
        <TopCountriesMiniCard items={top5Countries} />
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <PlatformMultiToggle
          platforms={platforms}
          selected={selectedPlatforms}
          onChange={setSelectedPlatforms}
        />
        <HierarchyBreadcrumb
          level={level}
          continent={selectedContinent}
          country={selectedCountry}
          region={selectedRegion}
          onClick={handleBreadcrumbClick}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GeoMap level={level} items={aggregated} onDrill={handleDrill} />
        <GeoTable items={aggregated} onDrill={handleDrill} />
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

type HierarchyBreadcrumbProps = {
  level: GeoLevel
  continent: string | null
  country: string | null
  region: string | null
  onClick: (level: GeoLevel) => void
}

function HierarchyBreadcrumb({
  level,
  continent,
  country,
  region,
  onClick,
}: HierarchyBreadcrumbProps) {
  const itemClass = (active: boolean) =>
    `cursor-pointer text-xs ${
      active
        ? "font-semibold text-neutral-900"
        : "text-neutral-500 hover:text-neutral-800"
    }`

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <span className={itemClass(level === "world")} onClick={() => onClick("world")}>
        World
      </span>
      <span className="text-neutral-400">/</span>
      <span
        className={itemClass(level === "continent")}
        onClick={() => onClick("continent")}
      >
        {continent ?? "Continent"}
      </span>
      <span className="text-neutral-400">/</span>
      <span
        className={itemClass(level === "country")}
        onClick={() => onClick("country")}
      >
        {country ?? "Country"}
      </span>
      <span className="text-neutral-400">/</span>
      <span
        className={itemClass(level === "region")}
        onClick={() => onClick("region")}
      >
        {region ?? "Region"}
      </span>
      <span className="text-neutral-400">/</span>
      <span className={itemClass(level === "city")}>City</span>
    </div>
  )
}

/* ---------- MAP + TABLE + MINI CARD ---------- */

type GeoMapProps = {
  level: GeoLevel
  items: AggregatedLocation[]
  onDrill: (item: AggregatedLocation) => void
}

function GeoMap({ level, items, onDrill }: GeoMapProps) {
  return (
    <div className="relative h-72 w-full rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-700">
          Map view · {levelLabel(level)}
        </span>
        <span className="text-[10px] text-neutral-500">
          Click a location to drill down
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
            className="flex min-w-[90px] flex-col rounded-md border border-neutral-200 bg-white px-2 py-1 text-left text-[11px] shadow-sm hover:border-neutral-400"
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

type GeoTableProps = {
  items: AggregatedLocation[]
  onDrill: (item: AggregatedLocation) => void
}

function GeoTable({ items, onDrill }: GeoTableProps) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-md border border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700">
        Ranked locations
      </div>
      <div className="h-[calc(100%-2rem)] overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-neutral-100 text-[11px] text-neutral-500">
              <th className="px-3 py-2 text-left font-normal">Location</th>
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
                      {levelLabel(item.level)}
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

type TopCountriesMiniCardProps = {
  items: AggregatedLocation[]
}

function TopCountriesMiniCard({ items }: TopCountriesMiniCardProps) {
  return (
    <div className="w-40 rounded-md border border-neutral-200 bg-neutral-50 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-neutral-700">
          Top 5 countries
        </span>
      </div>
      <div className="space-y-1">
        {items.length === 0 && (
          <div className="py-2 text-[10px] text-neutral-400">
            No country data yet.
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

function levelLabel(level: GeoLevel): string {
  if (level === "world") return "World"
  if (level === "continent") return "Continent"
  if (level === "country") return "Country"
  if (level === "region") return "Region"
  return "City"
}

function platformTooltip(platforms: Record<string, number>): string {
  const entries = Object.entries(platforms)
  if (entries.length === 0) return ""
  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([platform, value]) => `${platform}: ${value.toLocaleString()}`)
    .join(" • ")
}