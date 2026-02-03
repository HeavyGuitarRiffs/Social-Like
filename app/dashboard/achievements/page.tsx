"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Trophy,
  Award,
  Star,
  Flame,
  Crown,
  Medal,
  Sparkles,
  Target,
  MessageSquare,
  Heart,
  Camera,
  Megaphone,
} from "lucide-react";

export default function AchievementsPage() {
  // MOCK DATA — replace with Supabase later
  const [followers] = useState(620);
  const [subscribers] = useState(12000);
  const [commentsX] = useState(2400);
  const [postsInsta] = useState(180);
  const [socialAccounts] = useState(4);
  const [commentedPlatforms] = useState(12);
  const [topComments] = useState(3);

  const achievements = [
    // 🔥 BASIC ACHIEVEMENTS
    {
      title: "New Account",
      desc: "Started your social media journey",
      icon: <Star className="w-6 h-6 text-primary" />,
      unlocked: true,
    },
    {
      title: "First Post",
      desc: "Published your first post",
      icon: <Award className="w-6 h-6 text-secondary" />,
      unlocked: true,
    },
    {
      title: "First Reply",
      desc: "Replied to someone for the first time",
      icon: <MessageIcon />,
      unlocked: true,
    },
    {
      title: "First Reply on a New Video",
      desc: "Engaged early on new content",
      icon: <Sparkles className="w-6 h-6 text-accent" />,
      unlocked: true,
    },

    // 🧠 SKILL / QUALITY ACHIEVEMENTS
    {
      title: "Clever",
      desc: "Top comment on a forum post",
      icon: <Crown className="w-6 h-6 text-warning" />,
      unlocked: topComments >= 1,
    },
    {
      title: "Well Liked",
      desc: "Top liked comment on a post",
      icon: <HeartIcon />,
      unlocked: topComments >= 3,
    },

    // 🌐 SOCIAL ACCOUNT ACHIEVEMENTS
    {
      title: "Social Banker",
      desc: "Opened 5 social media accounts",
      icon: <Medal className="w-6 h-6 text-success" />,
      unlocked: socialAccounts >= 5,
    },
    {
      title: "Social Butterfly",
      desc: "Commented on 10+ different platforms",
      icon: <Flame className="w-6 h-6 text-pink-500" />,
      unlocked: commentedPlatforms >= 10,
    },

    // 📈 FOLLOWER MILESTONES
    {
      title: "Likable",
      desc: "Reached 100 followers",
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      unlocked: followers >= 100,
    },
    {
      title: "Popular",
      desc: "Reached 500 followers",
      icon: <Star className="w-6 h-6 text-orange-400" />,
      unlocked: followers >= 500,
    },
    {
      title: "Trending",
      desc: "Reached 1,000 followers",
      icon: <Flame className="w-6 h-6 text-red-500" />,
      unlocked: followers >= 1000,
    },
    {
      title: "Established",
      desc: "Reached 10,000 subscribers",
      icon: <Trophy className="w-6 h-6 text-purple-500" />,
      unlocked: subscribers >= 10000,
    },
    {
      title: "15 Minutes",
      desc: "Reached 100,000 subscribers",
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      unlocked: subscribers >= 100000,
    },
    {
      title: "Icon",
      desc: "Reached 1,000,000 followers",
      icon: <Crown className="w-6 h-6 text-primary" />,
      unlocked: followers >= 1000000,
    },

    // 📝 ACTIVITY ACHIEVEMENTS
    {
      title: "Insta Grinder",
      desc: "Posted 1,000 photos on Instagram",
      icon: <CameraIcon />,
      unlocked: postsInsta >= 1000,
    },
    {
      title: "Socialite",
      desc: "1,000 comments on X",
      icon: <MessageIcon />,
      unlocked: commentsX >= 1000,
    },
    {
      title: "Talking Head",
      desc: "10,000 comments on X",
      icon: <MegaphoneIcon />,
      unlocked: commentsX >= 10000,
    },
  ];

  return (
    <main className="min-h-screen bg-base-100 px-6 py-12 text-base-content">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Your Achievements</h1>
          <p className="opacity-70 max-w-xl">
            Unlock badges as you grow your influence, expand your reach, and build your social legacy.
          </p>
        </div>

        {/* ACHIEVEMENTS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {achievements.map((a, i) => (
            <Card
              key={i}
              className={`transition border ${
                a.unlocked
                  ? "bg-base-200 border-primary shadow-lg"
                  : "bg-base-300 opacity-50"
              }`}
            >
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-3 rounded-full bg-base-100 shadow">{a.icon}</div>
                <CardTitle>{a.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="opacity-70 text-sm">{a.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* CTA */}
        <button className="btn btn-primary btn-lg w-full mt-10">
          Add Contribution / Update Progress
        </button>
      </div>
    </main>
  );
}

/* ICON HELPERS */
function MessageIcon() {
  return <MessageSquare className="w-6 h-6 text-blue-400" />;
}
function HeartIcon() {
  return <Heart className="w-6 h-6 text-rose-500" />;
}
function CameraIcon() {
  return <Camera className="w-6 h-6 text-pink-400" />;
}
function MegaphoneIcon() {
  return <Megaphone className="w-6 h-6 text-indigo-400" />;
}