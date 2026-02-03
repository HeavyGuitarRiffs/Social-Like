// DeviceBreakdown.tsx
"use client"

import React, { useMemo, useState } from "react"

type NormalizedDeviceCategory =
  | "desktop"
  | "mobile"
  | "tablet"
  | "tv"
  | "console"
  | "wearable"
  | "other"

type DeviceLevel = "category" | "os" | "browser" | "version"

type DeviceBreakdownRow = {
  device_category: string | null
  os: string | null
  browser: string | null
  version: string | null
  value: number
  platform: string | null // null = total
}

type DeviceBreakdownProps = {
  data: DeviceBreakdownRow[]
  platforms: string[]
}

type AggregatedLocation = {
  key: string
  label: string
  level: DeviceLevel
  value: number
  platforms: Record<string, number>
  category?: NormalizedDeviceCategory | null
  os?: string | null
  browser?: string | null
  version?: string | null
}

export function DeviceBreakdownComponent({
  data,
  platforms,
}: DeviceBreakdownProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["total"])
  const [level, setLevel] = useState<DeviceLevel>("category")
  const [selectedCategory, setSelectedCategory] =
    useState<NormalizedDeviceCategory | null>(null)
  const [selectedOs, setSelectedOs] = useState<string | null>(null)
  const [selectedBrowser, setSelectedBrowser] = useState<string | null>(null)

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
      lvl: DeviceLevel,
      row: DeviceBreakdownRow,
      meta: {
        category?: NormalizedDeviceCategory | null
        os?: string | null
        browser?: string | null
        version?: string | null
      },
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
          category: meta.category,
          os: meta.os,
          browser: meta.browser,
          version: meta.version,
        })
      } else {
        existing.value += row.value
        existing.platforms[platformKey] =
          (existing.platforms[platformKey] ?? 0) + row.value
      }
    }

    for (const row of filteredByPlatform) {
      const category = normalizeDeviceCategory(row.device_category)

      if (level === "category") {
        const label = labelForCategory(category)
        pushRow(
          `category:${category}`,
          label,
          "category",
          row,
          { category },
        )
      } else if (level === "os") {
        if (selectedCategory && category !== selectedCategory) continue
        const osLabel = row.os ?? "Unknown OS"
        pushRow(
          `os:${category}:${osLabel}`,
          osLabel,
          "os",
          row,
          { category, os: row.os },
        )
      } else if (level === "browser") {
        if (selectedCategory && category !== selectedCategory) continue
        if (selectedOs && row.os !== selectedOs) continue
        const browserLabel = row.browser ?? "Unknown browser"
        pushRow(
          `browser:${category}:${row.os ?? "unknown"}:${browserLabel}`,
          browserLabel,
          "browser",
          row,
          { category, os: row.os, browser: row.browser },
        )
      } else if (level === "version") {
        if (selectedCategory && category !== selectedCategory) continue
        if (selectedOs && row.os !== selectedOs) continue
        if (selectedBrowser && row.browser !== selectedBrowser) continue
        const versionLabel = row.version ?? "Unknown version"
        pushRow(
          `version:${category}:${row.os ?? "unknown"}:${
            row.browser ?? "unknown"
          }:${versionLabel}`,
          versionLabel,
          "version",
          row,
          {
            category,
            os: row.os,
            browser: row.browser,
            version: row.version,
          },
        )
      }
    }

    return Array.from(map.values()).sort((a, b) => b.value - a.value)
  }, [filteredByPlatform, level, selectedCategory, selectedOs, selectedBrowser])

  const topDevices = useMemo<AggregatedLocation[]>(() => {
    const map = new Map<string, AggregatedLocation>()

    for (const row of filteredByPlatform) {
      const category = normalizeDeviceCategory(row.device_category)
      const categoryLabel = labelForCategory(category)
      const osLabel = row.os ?? "Unknown OS"
      const label = `${categoryLabel} · ${osLabel}`
      const key = `top:${category}:${osLabel}`
      const platformKey = row.platform ?? "total"
      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          key,
          label,
          level: "os",
          value: row.value,
          platforms: { [platformKey]: row.value },
          category,
          os: row.os,
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
    if (item.level === "category") {
      setSelectedCategory(item.category ?? null)
      setSelectedOs(null)
      setSelectedBrowser(null)
      setLevel("os")
    } else if (item.level === "os") {
      setSelectedCategory(item.category ?? null)
      setSelectedOs(item.os ?? null)
      setSelectedBrowser(null)
      setLevel("browser")
    } else if (item.level === "browser") {
      setSelectedCategory(item.category ?? null)
      setSelectedOs(item.os ?? null)
      setSelectedBrowser(item.browser ?? null)
      setLevel("version")
    }
  }

  const handleBreadcrumbClick = (target: DeviceLevel) => {
    setLevel(target)
    if (target === "category") {
      setSelectedCategory(null)
      setSelectedOs(null)
      setSelectedBrowser(null)
    } else if (target === "os") {
      setSelectedOs(null)
      setSelectedBrowser(null)
    } else if (target === "browser") {
      setSelectedBrowser(null)
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            Device breakdown
          </h2>
          <p className="text-xs text-neutral-500">
            Device category → OS → browser → version, with platform-aware drilldowns.
          </p>
        </div>
        <TopDevicesMiniCard items={topDevices} />
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <PlatformMultiToggle
          platforms={platforms}
          selected={selectedPlatforms}
          onChange={setSelectedPlatforms}
        />
        <DeviceHierarchyBreadcrumb
          level={level}
          category={selectedCategory}
          os={selectedOs}
          browser={selectedBrowser}
          onClick={handleBreadcrumbClick}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DeviceGrid items={aggregated} level={level} onDrill={handleDrill} />
        <DeviceTable items={aggregated} onDrill={handleDrill} />
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

type DeviceHierarchyBreadcrumbProps = {
  level: DeviceLevel
  category: NormalizedDeviceCategory | null
  os: string | null
  browser: string | null
  onClick: (level: DeviceLevel) => void
}

function DeviceHierarchyBreadcrumb({
  level,
  category,
  os,
  browser,
  onClick,
}: DeviceHierarchyBreadcrumbProps) {
  const itemClass = (active: boolean) =>
    `cursor-pointer text-xs ${
      active
        ? "font-semibold text-neutral-900"
        : "text-neutral-500 hover:text-neutral-800"
    }`

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <span
        className={itemClass(level === "category")}
        onClick={() => onClick("category")}
      >
        {category ? labelForCategory(category) : "Device category"}
      </span>
      <span className="text-neutral-400">/</span>
      <span
        className={itemClass(level === "os")}
        onClick={() => onClick("os")}
      >
        {os ?? "OS"}
      </span>
      <span className="text-neutral-400">/</span>
      <span
        className={itemClass(level === "browser")}
        onClick={() => onClick("browser")}
      >
        {browser ?? "Browser"}
      </span>
      <span className="text-neutral-400">/</span>
      <span className={itemClass(level === "version")}>Version</span>
    </div>
  )
}

/* ---------- GRID + TABLE + MINI CARD ---------- */

type DeviceGridProps = {
  level: DeviceLevel
  items: AggregatedLocation[]
  onDrill: (item: AggregatedLocation) => void
}

function DeviceGrid({ level, items, onDrill }: DeviceGridProps) {
  return (
    <div className="relative h-72 w-full rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-700">
          Device view · {deviceLevelLabel(level)}
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

type DeviceTableProps = {
  items: AggregatedLocation[]
  onDrill: (item: AggregatedLocation) => void
}

function DeviceTable({ items, onDrill }: DeviceTableProps) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-md border border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700">
        Ranked devices
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
                      {deviceLevelLabel(item.level)}
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

type TopDevicesMiniCardProps = {
  items: AggregatedLocation[]
}

function TopDevicesMiniCard({ items }: TopDevicesMiniCardProps) {
  return (
    <div className="w-48 rounded-md border border-neutral-200 bg-neutral-50 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-neutral-700">
          Top 5 device combos
        </span>
      </div>
      <div className="space-y-1">
        {items.length === 0 && (
          <div className="py-2 text-[10px] text-neutral-400">
            No device data yet.
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

function normalizeDeviceCategory(
  raw: string | null,
): NormalizedDeviceCategory {
  if (!raw) return "other"
  const v = raw.toLowerCase().trim()

  if (v.includes("desktop") || v.includes("pc") || v.includes("mac")) {
    return "desktop"
  }
  if (
    v.includes("mobile") ||
    v.includes("phone") ||
    v.includes("iphone") ||
    v.includes("android")
  ) {
    return "mobile"
  }
  if (v.includes("tablet") || v.includes("ipad")) {
    return "tablet"
  }
  if (v.includes("tv") || v.includes("smarttv") || v.includes("smart tv")) {
    return "tv"
  }
  if (
    v.includes("xbox") ||
    v.includes("playstation") ||
    v.includes("ps4") ||
    v.includes("ps5") ||
    v.includes("switch") ||
    v.includes("console")
  ) {
    return "console"
  }
  if (
    v.includes("watch") ||
    v.includes("wearable") ||
    v.includes("fitbit") ||
    v.includes("garmin")
  ) {
    return "wearable"
  }

  return "other"
}

function labelForCategory(category: NormalizedDeviceCategory): string {
  if (category === "desktop") return "Desktop"
  if (category === "mobile") return "Mobile"
  if (category === "tablet") return "Tablet"
  if (category === "tv") return "TV"
  if (category === "console") return "Console"
  if (category === "wearable") return "Wearable"
  return "Other"
}

function deviceLevelLabel(level: DeviceLevel): string {
  if (level === "category") return "Device category"
  if (level === "os") return "Operating system"
  if (level === "browser") return "Browser"
  return "Version"
}

function platformTooltip(platforms: Record<string, number>): string {
  const entries = Object.entries(platforms)
  if (entries.length === 0) return ""
  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([platform, value]) => `${platform}: ${value.toLocaleString()}`)
    .join(" • ")
}