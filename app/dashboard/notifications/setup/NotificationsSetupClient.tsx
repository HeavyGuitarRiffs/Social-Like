"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

import { Bell, Mail, AppWindow } from "lucide-react";

export default function NotificationsSetupClient({
  userId,
  initialPrefs,
}: {
  userId: string;
  initialPrefs: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    smartDefaults: boolean;
    intensity: "low" | "medium" | "high";
  };
}) {
  const router = useRouter();
  const supabase = createClient();

  /* -------------------- State -------------------- */
  const [pushPref, setPushPref] = useState(initialPrefs.pushEnabled);
  const [emailPref, setEmailPref] = useState(initialPrefs.emailEnabled);
  const [inAppPref, setInAppPref] = useState(initialPrefs.inAppEnabled);
  const [smartDefaults, setSmartDefaults] = useState(initialPrefs.smartDefaults);
  const [intensity, setIntensity] = useState(initialPrefs.intensity);

  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  /* -------------------- Save -------------------- */
  async function savePreferences() {
    if (saving) return;

    setSaving(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 5));
    }, 40);

    try {
      const { error } = await supabase.from("user_notifications").upsert({
        user_id: userId,
        push_enabled: pushPref,
        email_enabled: emailPref,
        in_app_enabled: inAppPref,
        smart_defaults: smartDefaults,
        intensity,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Direct, immediate redirect — no delay, no toast dependency
      router.push("/dashboard/success");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save preferences");
    } finally {
      clearInterval(interval);
      setSaving(false);
      setProgress(100);
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <section className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-10 text-center">

        {/* Progress */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
            className="h-full bg-primary"
          />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Step 3 of 3</p>
          <h1 className="text-3xl font-extrabold">
            Notifications & Preferences
          </h1>
        </div>

        {/* Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Choose how you want to be notified
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-10">

            {/* Push */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <p className="font-medium">Push notifications</p>
              </div>
              <Switch
                checked={pushPref}
                onCheckedChange={setPushPref}
              />
            </div>

            {/* Email */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <p className="font-medium">Email notifications</p>
              </div>
              <Switch
                checked={emailPref}
                onCheckedChange={setEmailPref}
              />
            </div>

            {/* In-App */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <AppWindow className="h-5 w-5 text-primary" />
                <p className="font-medium">In-app reminders</p>
              </div>
              <Switch
                checked={inAppPref}
                onCheckedChange={setInAppPref}
              />
            </div>

            {/* Smart Defaults */}
            <div className="space-y-3">
              <p className="font-medium">Smart defaults</p>
              <Switch
                checked={smartDefaults}
                onCheckedChange={setSmartDefaults}
              />
            </div>

            {/* Intensity */}
            <div className="space-y-3">
              <p className="font-medium">Notification intensity</p>
              <RadioGroup
                value={intensity}
                onValueChange={(v) =>
                  setIntensity(v as "low" | "medium" | "high")
                }
                className="flex justify-center gap-8"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="low" />
                  <span>Low</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="medium" />
                  <span>Medium</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="high" />
                  <span>High</span>
                </label>
              </RadioGroup>
            </div>

          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center pt-6">
          <Button
            size="lg"
            disabled={saving}
            onClick={savePreferences}
            className="px-10 py-6 text-lg font-semibold"
          >
            Finish Setup →
          </Button>
        </div>

      </div>
    </section>
  );
}