"use client";

import { useEffect, useState, ComponentType, SVGProps } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/UserProvider";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

// Social icons
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaSnapchat,
  FaLinkedin,
  FaPinterest,
  FaReddit,
  FaYoutube,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa";

/* ------------------------------------------------------------------ */
/* Types */
interface StatCard {
  platform: string;
  percent: string;
  postsToday: number;
  commentCountStart: number;
  totalPosts?: number;
  totalComments?: number;
  Icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

/* ------------------------------------------------------------------ */
/* Static maps (SSR-safe) */
const socialIconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Facebook: FaFacebook,
  Instagram: FaInstagram,
  Twitter: FaTwitter,
  TikTok: FaTiktok,
  Snapchat: FaSnapchat,
  LinkedIn: FaLinkedin,
  Pinterest: FaPinterest,
  Reddit: FaReddit,
  YouTube: FaYoutube,
  WhatsApp: FaWhatsapp,
  Telegram: FaTelegram,
  Discord: FaDiscord,
};

const socialNames = Object.keys(socialIconMap);

/* ------------------------------------------------------------------ */
/* Sidebar */
export function Sidebar() {
  const { theme, setTheme } = useTheme();

  return (
    <aside className="group fixed left-0 top-0 h-full w-20 hover:w-64 bg-background border-r border-border flex flex-col items-start py-8 px-4 transition-all duration-300 z-50">
      <div className="w-12 h-12 mb-6 ml-1 group-hover:ml-0 transition-all">
        <Image
          src="/icon.png"
          alt="Social Like Logo"
          width={48}
          height={48}
          className="rounded-full"
          priority
        />
      </div>

      <nav className="flex flex-col gap-6 mt-4 w-full">
        {[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Pricing", href: "/pricing" },
          { label: "Connect", href: "/dashboard/connect" },
          { label: "Dashboard", href: "/dashboard" },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 opacity-70 hover:opacity-100 transition text-lg"
          >
            <span className="w-6 h-6 bg-muted rounded-md" />
            <span className="hidden group-hover:inline-block">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="mt-auto flex items-center gap-3 opacity-70 hover:opacity-100 transition text-lg"
      >
        {theme === "dark" ? (
          <Sun className="w-6 h-6" />
        ) : (
          <Moon className="w-6 h-6" />
        )}
        <span className="hidden group-hover:inline-block">
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
      </button>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Page */
export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const [mounted, setMounted] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [socialPower, setSocialPower] = useState(128420);
  const [toastIndex, setToastIndex] = useState(0);
  const [cards, setCards] = useState<StatCard[]>([]);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    requestAnimationFrame(() => {
      const generated: StatCard[] = Array.from({ length: 90 }, (_, i) => {
        const platform = socialNames[i % socialNames.length];
        return {
          platform,
          Icon: socialIconMap[platform],
          percent: `+${Math.floor(Math.random() * 5) + 1}%`,
          postsToday: Math.floor(Math.random() * 15),
          commentCountStart: Math.floor(Math.random() * 200),
          totalPosts: Math.floor(Math.random() * 500),
          totalComments: Math.floor(Math.random() * 5000),
        };
      });
      setCards(generated);
    });
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const i = setInterval(
      () => setSocialPower(p => p + Math.floor(Math.random() * 10) + 1),
      120
    );
    return () => clearInterval(i);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const i = setInterval(
      () => setOnlineCount(p => p + Math.floor(Math.random() * 3)),
      2000
    );
    return () => clearInterval(i);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || cards.length === 0) return;
    const i = setInterval(
      () => setToastIndex(p => (p + 1) % cards.length),
      7000
    );
    return () => clearInterval(i);
  }, [mounted, cards.length]);

  if (!mounted) return null;

  const toastPositions = ["top-20", "bottom-20"];
  const toastPosition = toastPositions[toastIndex % 2];

  return (
    <>
      <Sidebar />

      {/* SOCIAL POWER */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 bg-base-200 shadow-xl rounded-xl px-6 py-4 border border-base-300">
        <p className="text-sm opacity-70 font-semibold tracking-wide">
          SOCIAL POWER
        </p>
        <p className="text-4xl font-extrabold text-primary tabular-nums">
          {socialPower}
        </p>
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pl-28 pr-6 bg-base-100 overflow-hidden">
        <div
          className="absolute right-0 top-0 h-full w-1/2 opacity-60 pointer-events-none"
          style={{
            backgroundImage: "url('/quantumswirl.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <h1 className="text-[48px] font-extrabold">
              The <span className="text-primary">Universal Incentive Engine</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Social Like unifies every creator platform into one compounding
              analytics engine — powering growth, monetization, and the
              incentives that move the internet.
            </p>

            <p className="text-lg text-base-content/70 font-medium">
              {onlineCount === 1
                ? "1 person now checking Social Like"
                : `${onlineCount} people now checking Social Like`}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-content hover:scale-105 transition"
            >
              Start Tracking
            </Link>

            {authLoading ? (
              <div className="px-6 py-3 bg-secondary/50 rounded-full animate-pulse text-center text-secondary-content">
                Checking...
              </div>
            ) : !user ? (
              <Button
                onClick={() => router.push("/login")}
                className="px-6 py-3 bg-secondary text-secondary-content hover:scale-105 transition"
              >
                Login / Sign Up
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 px-10 bg-base-200">
        <div className="max-w-6xl mx-auto space-y-20">
          <h2 className="text-6xl font-extrabold text-center">
            One Dashboard. Every Platform.
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-10 bg-base-100 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-3xl font-bold">Unified Analytics</h3>
              <p className="text-base-content/70">
                See your entire creator footprint in one place — no more switching apps.
              </p>
            </div>

            <div className="p-10 bg-base-100 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-3xl font-bold">Real Influence</h3>
              <p className="text-base-content/70">
                Your audience is bigger than your follower count. Social Like proves it.
              </p>
            </div>

            <div className="p-10 bg-base-100 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-3xl font-bold">Monetization Ready</h3>
              <p className="text-base-content/70">
                Unlock insights that help you negotiate brand deals and sponsorships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 px-10 bg-base-100">
        <div className="max-w-6xl mx-auto space-y-20">
          <h2 className="text-6xl font-extrabold text-center">
            Loved by Creators Everywhere
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-10 bg-base-200 rounded-3xl shadow-xl space-y-4">
              <p className="text-lg italic">
                “Social Like showed me influence I didn’t even know I had.”
              </p>
              <p className="font-bold">— Alex, Music Creator</p>
            </div>

            <div className="p-10 bg-base-200 rounded-3xl shadow-xl space-y-4">
              <p className="text-lg italic">
                “Finally a dashboard that understands creators.”
              </p>
              <p className="font-bold">— Maya, Fashion Influencer</p>
            </div>

            <div className="p-10 bg-base-200 rounded-3xl shadow-xl space-y-4">
              <p className="text-lg italic">
                “My brand deals doubled after using Social Like.”
              </p>
              <p className="font-bold">— Jordan, YouTuber</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT HUNT BADGE */}
      <a
        href="https://www.producthunt.com"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 opacity-80 hover:opacity-100 transition hidden md:block"
      >

        
        <Image
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=000000&theme=light"
          alt="Product Hunt"
          width={250}
          height={54}
        />
      </a>

      {/* FOOTERS */}
      <footer className="py-20 px-10 bg-base-200 border-t border-base-300">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-4">Social Like</h3>
            <p className="text-base-content/70">
              The universal incentive engine for creators.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Trust & Security</h3>
            <ul className="space-y-2 text-base-content/70">
              <li>🔒 Secure authentication</li>
              <li>🛡️ Encrypted data</li>
              <li>💳 Stripe-powered payments</li>
              <li>📄 Transparent pricing</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-base-content/70">
              <li><a href="/about">About</a></li>
              <li><a href="/pricing">Pricing</a></li>
              <li><a href="/terms">Terms</a></li>
              <li><a href="/privacy">Privacy</a></li>
            </ul>
          </div>
        </div>
      </footer>

      <footer className="w-full border-t border-border mt-16 py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Social Like. All rights reserved.
      </footer>
    </>
  );
}
