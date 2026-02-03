"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const mockLeaders = [
  { rank: 1, name: "Alex", comments: 128, streak: 14 },
  { rank: 2, name: "Jordan", comments: 112, streak: 11 },
  { rank: 3, name: "Taylor", comments: 97, streak: 9 },
  { rank: 4, name: "You", comments: 84, streak: 6 },
  { rank: 5, name: "Morgan", comments: 72, streak: 5 },
]

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-base-100 px-6 py-12 text-base-content">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Leaderboard
          </h1>
          <p className="opacity-70">
            Top commenters this week
          </p>
        </div>

        {/* LEADERBOARD */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Rankings</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {mockLeaders.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  user.name === "You"
                    ? "bg-primary text-primary-content"
                    : "bg-base-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold w-6">#{user.rank}</span>
                  <span className="font-medium">{user.name}</span>
                </div>

                <div className="flex gap-6 text-sm">
                  <span>{user.comments} comments</span>
                  <span>🔥 {user.streak}d</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
