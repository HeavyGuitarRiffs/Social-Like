"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">Payment Successful</h1>
        <p className="text-white/70">Your purchase is confirmed.</p>

        <div className="flex justify-center gap-4 mt-8">
          <Link href="/" className="btn btn-outline">
            Home
          </Link>

          <Link href="/dashboard" className="btn btn-accent">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}