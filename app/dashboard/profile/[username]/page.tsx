// dashboard/profile/[username]/page.tsx
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"

interface ProfileProps {
  params: { username: string }
}

export default async function PublicProfilePage({ params }: ProfileProps) {
  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
        display_name,
        bio,
        social_archetype,
        country,
        timezone,
        streak_days,
        points,
        highlighted_comments
      `
    )
    .eq("username", params.username)
    .single()

  if (!profile) notFound()

  return (
    <main className="min-h-screen bg-base-100 text-base-content px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-10">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {profile.display_name}
          </h1>
          <p className="text-sm opacity-70">{profile.bio}</p>
          <div className="flex justify-center gap-2 text-xs opacity-60">
            <span>{profile.social_archetype}</span>
            <span>• {profile.country}</span>
            <span>• {profile.timezone}</span>
          </div>
        </div>

        {/* STREAK CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Streaks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Current Streak</span>
              <span className="font-bold">{profile.streak_days} days</span>
            </div>
            <progress
              className="progress progress-primary"
              value={profile.streak_days}
              max={30}
            />
            <p className="text-xs opacity-60">
              Streaks show consistency and unlock rewards
            </p>
          </CardContent>
        </Card>

        {/* CONTRIBUTION STATS */}
        <Card>
          <CardHeader>
            <CardTitle>Contribution Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Posts" value={profile.posts ?? 0} />
              <Stat label="Comments" value={profile.comments ?? 0} />
              <Stat label="Outreach" value={profile.outreach ?? 0} />
              <Stat label="Points" value={profile.points} />
            </div>
          </CardContent>
        </Card>

        {/* HIGHLIGHTED COMMENTS */}
        <Card>
          <CardHeader>
            <CardTitle>Highlighted Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.highlighted_comments?.map((c: string, idx: number) => (
              <div key={idx} className="glass p-3 rounded-lg text-sm">
                {c}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA / FOLLOW */}
        <button className="btn btn-primary btn-lg w-full">
          Follow {profile.display_name}
        </button>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col bg-base-200 rounded-xl p-4 items-center justify-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  )
}