"use client";

import FeedbackForm from "@/components/FeedbackForm";
import { Toaster } from "sonner";

export default function FeedbackPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Send Us Your Feedback</h1>

      <FeedbackForm />

      {/* Sonner toast container */}
      <Toaster position="top-right" />
    </main>
  );
}
