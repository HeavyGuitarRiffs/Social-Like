"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GoalsPage() {
  return (
    <main className="min-h-screen bg-base-100 px-6 py-12 text-base-content">
      <div className="mx-auto max-w-4xl space-y-10">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Daily Goals
          </h1>
          <p className="opacity-70">
            Define your personal growth targets
          </p>
        </div>

        {/* GOALS */}
        <section className="grid md:grid-cols-2 gap-6">

          <GoalCard
            title="Comments per day"
            description="Replies, discussions, engagement"
          />

          <GoalCard
            title="Posts per day"
            description="Original content published"
          />

          <GoalCard
            title="Outreach per day"
            description="DMs, cold messages, follow-ups"
          />

          <GoalCard
            title="Impressions goal"
            description="Total reach target"
          />

          <GoalCard
            title="Likes goal"
            description="Engagement validation"
          />

        </section>

        {/* SAVE */}
        <button className="btn btn-primary w-full">
          Save goals
        </button>

      </div>
    </main>
  )
}

function GoalCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm opacity-70">{description}</p>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            className="input input-bordered w-full"
            placeholder="Set target"
          />
          <span className="text-sm opacity-60">/ day</span>
        </div>
      </CardContent>
    </Card>
  )
}
