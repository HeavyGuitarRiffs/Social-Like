"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

function ConfettiPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-48 w-full bg-muted rounded-xl flex items-center justify-center shadow-inner"
    >
      🎉 Confetti Placeholder 🎉
    </motion.div>
  );
}

export default function SuccessPageClient() {
  return (
    <section className="min-h-screen bg-background px-6 py-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mx-auto max-w-3xl space-y-10 text-center"
      >
        <ConfettiPlaceholder />

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="text-4xl font-extrabold tracking-tight"
        >
          Welcome to Social Like
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="text-muted-foreground max-w-md mx-auto text-lg"
        >
          You’re officially in with us.  
          From here on out, we’ll track the signals that actually matter —  
          engagement velocity, audience momentum, creator health, and the path to monetized socials.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="pt-4"
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition"
            >
              Go to Dashboard →
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}