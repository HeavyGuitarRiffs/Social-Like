// app/paywall/page.tsx
import Link from "next/link";

export default function PaywallPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-base-100 text-base-content px-4">
      <div className="max-w-lg w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold">Unlock Qubit Pro</h1>

        <p className="opacity-80">
          You’ve hit a paid feature. Upgrade to keep tracking your creator
          momentum across all platforms.
        </p>

        <div className="card bg-base-200 shadow-md">
          <div className="card-body space-y-4">
            <ul className="space-y-2 text-left text-sm">
              <li>• Unlimited platform syncs</li>
              <li>• Comment velocity & momentum insights</li>
              <li>• Streaks, habits, and consistency tracking</li>
              <li>• Priority access to new integrations</li>
            </ul>

            <Link href="/upgrade" className="btn btn-primary w-full">
              View Plans & Upgrade
            </Link>
          </div>
        </div>

        <Link href="/dashboard" className="link text-sm opacity-70">
          Go back to dashboard
        </Link>
      </div>
    </main>
  );
}
