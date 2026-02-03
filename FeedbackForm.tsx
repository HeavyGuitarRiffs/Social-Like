"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function FeedbackForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      if (res.ok) {
        setEmail("");
        setMessage("");
        toast.success("Thanks for the feedback!");
      } else {
        toast.error("Something went wrong");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-lg space-y-4">
      <input
        type="email"
        placeholder="Your email"
        className="w-full rounded-md border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <textarea
        placeholder="Your feedback..."
        className="w-full rounded-md border p-2 min-h-[120px]"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary text-primary-foreground py-2 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send feedback"}
      </button>
    </form>
  );
}
