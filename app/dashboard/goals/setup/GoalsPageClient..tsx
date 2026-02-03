"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Check } from "lucide-react";

import type { Intensity, GoalsSetupClientProps } from "./types";

const supabase = createClient();

// ------------------------------
// NumberWithControls (client-only)
// ------------------------------
function NumberWithControls(props: {
  label: string;
  min: number;
  max: number;
  value: string;
  onChange: (val: string) => void;
}) {
  const { label, min, max, value, onChange } = props;

  const numericValue = (() => {
    const n = Number(value);
    if (Number.isNaN(n)) return 0;
    return Math.min(Math.max(n, min), max);
  })();

  const handleInputChange = (val: string) => {
    if (val === "") return onChange("");
    if (/^\d+$/.test(val)) onChange(val);
  };

  return (
    <div className="space-y-3">
      <label className="text-base font-medium">{label}</label>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 text-xl"
          onClick={() => onChange(String(Math.max(numericValue - 1, min)))}
        >
          –
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              className="h-14 text-3xl text-center font-semibold"
              placeholder="0"
            />
          </TooltipTrigger>
          <TooltipContent>
            You can type a number, use the slider, or tap + / –.
          </TooltipContent>
        </Tooltip>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 text-xl"
          onClick={() => onChange(String(Math.min(numericValue + 1, max)))}
        >
          +
        </Button>
      </div>

      <div className="pt-2">
        <Slider
          value={[numericValue]}
          onValueChange={(vals) => onChange(String(vals[0] ?? 0))}
          min={min}
          max={max}
          step={1}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {numericValue} total
        </p>
      </div>
    </div>
  );
}

// ------------------------------
// Main Client Component
// ------------------------------
export default function GoalsSetupClient({
  userId,
  initialGoals,
}: GoalsSetupClientProps) {
  const [intensity, setIntensity] = useState<Intensity>(initialGoals.intensity);

  const [dailyEnabled, setDailyEnabled] = useState(initialGoals.dailyEnabled);
  const [weeklyEnabled, setWeeklyEnabled] = useState(initialGoals.weeklyEnabled);

  const [dailyComments, setDailyComments] = useState(initialGoals.dailyComments);
  const [weeklyPosts, setWeeklyPosts] = useState(initialGoals.weeklyPosts);

  const saveGoals = async () => {
    const { error } = await supabase.from("user_goals").upsert({
      user_id: userId,
      intensity,
      daily_enabled: dailyEnabled,
      weekly_enabled: weeklyEnabled,
      daily_comments: Number(dailyComments),
      weekly_posts: Number(weeklyPosts),
    });

    if (error) {
      console.error(error);
      toast.error("Failed to save goals");
      return;
    }

    toast.success("Goals saved!");
  };

  const intensityOptions = [
    { value: "light", label: "Light", subtitle: "Slow & steady" },
    { value: "balanced", label: "Balanced", subtitle: "Recommended" },
    { value: "aggressive", label: "Aggressive", subtitle: "Push yourself" },
  ];

  return (
    <section className="min-h-screen bg-background px-6 py-16 flex items-center justify-center">
      <Card className="w-full max-w-3xl shadow-2xl border border-border/50">
        <CardHeader className="text-center space-y-2 pb-10">
          <p className="text-sm text-muted-foreground tracking-wide">
            Step 2 of 3
          </p>
          <CardTitle className="text-4xl font-extrabold">
            Set Your Goals
          </CardTitle>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Choose the habits that will help you grow.
          </p>
        </CardHeader>

        <div className="w-11/12 mx-auto h-2 bg-muted rounded-full overflow-hidden mb-10">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: "66%" }}
          />
        </div>

        <CardContent className="space-y-10 pb-12">
          {/* INTENSITY */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              How ambitious do you want to be?
            </h2>

            <RadioGroup
              value={intensity}
              onValueChange={(val) => setIntensity(val as Intensity)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {intensityOptions.map((opt) => {
                const selected = intensity === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={[
                      "relative flex flex-col items-center gap-2 p-4 rounded-lg cursor-pointer border transition transform",
                      selected
                        ? "bg-primary/10 border-primary text-primary scale-[1.03]"
                        : "bg-background border-border hover:bg-muted",
                    ].join(" ")}
                  >
                    <div className="absolute top-2 right-2">
                      {selected && (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <RadioGroupItem
                      value={opt.value}
                      className="sr-only"
                      aria-label={opt.label}
                    />
                    <span className="font-semibold text-base">
                      {opt.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {opt.subtitle}
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {/* DAILY + WEEKLY */}
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="daily">
              <AccordionTrigger className="text-lg font-semibold">
                Daily Engagement
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Replying to comments, DMs, and mentions.
                  </span>
                  <Switch
                    checked={dailyEnabled}
                    onCheckedChange={setDailyEnabled}
                  />
                </div>

                {dailyEnabled && (
                  <NumberWithControls
                    label="Daily comments to reply"
                    min={0}
                    max={50}
                    value={dailyComments}
                    onChange={setDailyComments}
                  />
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="weekly">
              <AccordionTrigger className="text-lg font-semibold">
                Weekly Posting
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Publishing posts, threads, updates, or case studies.
                  </span>
                  <Switch
                    checked={weeklyEnabled}
                    onCheckedChange={setWeeklyEnabled}
                  />
                </div>

                {weeklyEnabled && (
                  <NumberWithControls
                    label="Weekly posts to publish"
                    min={0}
                    max={7}
                    value={weeklyPosts}
                    onChange={setWeeklyPosts}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* SAVE */}
          <div className="flex justify-center pt-6">
            <Button
              size="lg"
              className="px-10 py-6 text-lg font-semibold"
              onClick={saveGoals}
              asChild
            >
              <Link href="/dashboard/notifications/setup">
                Save & Continue →
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}