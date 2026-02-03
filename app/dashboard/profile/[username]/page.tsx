// app/dashboard/profile/[username]/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface ProfileProps {
  params: { username: string };
}

export default async function PublicProfilePage({ params }: ProfileProps) {
  // Bypass typed Supabase without using `any`
  const supabase = (await createSupabaseServerClient()) as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{ data: unknown }>;
        };
      };
    };
  };

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  // Cast the result to a loose object
  const profile = (data as Record<string, unknown>) || null;

  if (!profile) notFound();

  return (
    <main className="min-h-screen bg-base-100 text-base-content px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {profile.display_name as string}
          </h1>
          <p className="text-sm opacity-70">{profile.bio as string}</p>
          <div className="flex justify-center gap-2 text-xs opacity-60">
            <span>{profile.social_archetype as string}</span>
            <span>• {profile.country as string}</span>
            <span>• {profile.timezone as string}</span>
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
              <span className="font-bold">
                {(profile.streak_days as number) ?? 0} days
              </span>
            </div>
            <progress
              className="progress progress-primary"
              value={(profile.streak_days as number) ?? 0}
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
              <Stat label="Posts" value={(profile.posts as number) ?? 0} />
              <Stat label="Comments" value={(profile.comments as number) ?? 0} />
              <Stat label="Outreach" value={(profile.outreach as number) ?? 0} />
              <Stat label="Points" value={(profile.points as number) ?? 0} />
            </div>
          </CardContent>
        </Card>

        {/* HIGHLIGHTED COMMENTS */}
        <Card>
          <CardHeader>
            <CardTitle>Highlighted Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {((profile.highlighted_comments as string[]) ?? []).map(
              (c, idx) => (
                <div key={idx} className="glass p-3 rounded-lg text-sm">
                  {c}
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* CTA / FOLLOW */}
        <button className="btn btn-primary btn-lg w-full">
          Follow {profile.display_name as string}
        </button>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col bg-base-200 rounded-xl p-4 items-center justify-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}