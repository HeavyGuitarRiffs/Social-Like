"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    name: "Engagement Velocity",
    value: "+64%",
    desc: "How fast your audience reacts to new posts.",
  },
  {
    name: "Comment‑to‑Follower Ratio",
    value: "1.8%",
    desc: "A deeper signal of true audience connection.",
  },
  {
    name: "Posting Consistency Score",
    value: "92",
    desc: "Your rhythm, stability, and creator discipline.",
  },
  {
    name: "Audience Momentum",
    value: "+38%",
    desc: "Your growth trajectory across all platforms.",
  },
  {
    name: "Creator Health Index",
    value: "84",
    desc: "A holistic score of your creator performance.",
  },
  {
    name: "Multi‑Platform Sync Score",
    value: "73",
    desc: "How aligned your content is across platforms.",
  },
];

export default function StatsShowcasePage() {
  return (
    <section className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-12">

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold">Your Creator Metrics</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            These are the signals that actually matter — and the ones Social Like was built to track.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 shadow-xl hover:shadow-2xl transition rounded-2xl cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-2xl">{s.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-5xl font-extrabold">{s.value}</p>
                  <p className="text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center pt-10">
          <Link href="/dashboard/success">
            <Button size="lg" className="px-10 py-6 text-lg font-semibold">
              Finish →
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}