"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { FaTwitter, FaInstagram, FaTiktok, FaYoutube, FaLink } from "react-icons/fa";

const platforms = [
  {
    name: "Twitter / X",
    icon: <FaTwitter className="h-10 w-10 text-sky-500" />,
    stat: "+42%",
    desc: "We track engagement velocity, comment ratios, and creator momentum.",
  },
  {
    name: "Instagram",
    icon: <FaInstagram className="h-10 w-10 text-pink-500" />,
    stat: "+31%",
    desc: "We analyze reel performance, story retention, and audience health.",
  },
  {
    name: "TikTok",
    icon: <FaTiktok className="h-10 w-10 text-white" />,
    stat: "+57%",
    desc: "We measure viral potential, watch‑through rate, and trend alignment.",
  },
  {
    name: "YouTube",
    icon: <FaYoutube className="h-10 w-10 text-red-500" />,
    stat: "+24%",
    desc: "We track retention curves, comment quality, and subscriber velocity.",
  },
  {
    name: "Linktree",
    icon: <FaLink className="h-10 w-10 text-green-500" />,
    stat: "+18%",
    desc: "We unify your multi‑platform presence into one creator identity.",
  },
];

export default function PlatformsShowcasePage() {
  return (
    <section className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-12">

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold">Your Creator Universe</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Social Like tracks what other analytics tools miss — across every platform you use.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 shadow-xl hover:shadow-2xl transition rounded-2xl">
                <CardHeader className="flex items-center gap-4">
                  {p.icon}
                  <CardTitle className="text-2xl">{p.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-5xl font-extrabold">{p.stat}</p>
                  <p className="text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center pt-10">
          <Link href="/dashboard/showcase/stats">
            <Button size="lg" className="px-10 py-6 text-lg font-semibold">
              Continue →
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}