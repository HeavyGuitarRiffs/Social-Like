"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function PublicProfilePage({
  params,
}: {
  params: { username: string }
}) {
  return (
    <main className="min-h-screen bg-base-100 px-6 py-12 text-base-content">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* HEADER */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold">
            @{params.username}
          </h1>
          <p className="opacity-70">
            Consistent creator · Daily engagement
          </p>
        </div>

        {/* STATS */}
        <section className="grid grid-cols-3 gap-4">
          <Stat label="Streak" value="🔥 6" />
          <Stat label="Comments" value="1,248" />
          <Stat label="Rank" value="#42" />
        </section>

        {/* BIO */}
        <Card>
          <CardContent className="p-6 text-sm opacity-80">
            Building in public. One comment at a time.
          </CardContent>
        </Card>

      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs opacity-60">{label}</p>
      </CardContent>
    </Card>
  )
}
