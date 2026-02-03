//app\dashboard\store\StorePageClient.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StorePageClient() {
  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Store</h1>
        <p className="opacity-70">Coming soon</p>

        {/* Placeholder UI for future store */}
        <Card className="opacity-50 pointer-events-none">
          <CardContent className="flex items-center justify-between py-6">
            <span className="font-medium">Your Points</span>
            <span className="text-2xl font-extrabold">0 ⚡</span>
          </CardContent>
        </Card>

        <section className="grid md:grid-cols-3 gap-6 opacity-50 pointer-events-none">
          <Card>
            <CardHeader>
              <CardTitle>Reward Placeholder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm opacity-70">Rewards will appear here soon.</p>
              <div className="flex items-center justify-between">
                <span className="font-bold">—</span>
                <button className="btn btn-primary btn-sm">Redeem</button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}