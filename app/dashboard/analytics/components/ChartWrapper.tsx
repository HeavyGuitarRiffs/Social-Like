"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlatformSelector } from "./PlatformSelector";
import { Button } from "@/components/ui/button";

export type Mode = "total" | "platforms";
export type ChartType = "bar" | "area";

export type ChartWrapperRenderProps = {
  chartType: ChartType;
  mode: Mode;
  selectedPlatforms: string[];
};

const ChartContext = React.createContext<ChartWrapperRenderProps | null>(null);

export function useChartContext() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) {
    throw new Error("useChartContext must be used inside <ChartWrapper>");
  }
  return ctx;
}

interface ChartWrapperProps {
  title: string;
  platforms: string[];
  children: (props: ChartWrapperRenderProps) => React.ReactNode;
}

export function ChartWrapper({ title, platforms, children }: ChartWrapperProps) {
  const [mode, setMode] = React.useState<Mode>("total");
  const [chartType, setChartType] = React.useState<ChartType>("bar");
  const [selectedPlatforms, setSelectedPlatforms] =
    React.useState<string[]>(platforms);

  React.useEffect(() => {
    setSelectedPlatforms(platforms);
  }, [platforms]);

  const ctxValue: ChartWrapperRenderProps = {
    chartType,
    mode,
    selectedPlatforms,
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>

        <div className="flex flex-wrap items-center gap-2">
          {/* Chart type toggle */}
          <div className="flex items-center gap-1 rounded-md border p-1">
            <Button
              type="button"
              size="sm"
              variant={chartType === "bar" ? "default" : "ghost"}
              onClick={() => setChartType("bar")}
            >
              Bar
            </Button>
            <Button
              type="button"
              size="sm"
              variant={chartType === "area" ? "default" : "ghost"}
              onClick={() => setChartType("area")}
            >
              Area
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <PlatformSelector
          mode={mode}
          onModeChange={setMode}
          platforms={platforms}
          selectedPlatforms={selectedPlatforms}
          onPlatformChange={setSelectedPlatforms}
        />

        <ChartContext.Provider value={ctxValue}>
          {children(ctxValue)}
        </ChartContext.Provider>
      </CardContent>
    </Card>
  );
}