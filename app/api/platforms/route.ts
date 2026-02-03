// app/api/platforms/route.ts
import { NextResponse } from "next/server";

/**
 * GET /api/platforms
 * Returns a comprehensive list of platforms where users post, comment, or publish.
 */
export async function GET() {
  const platforms = [
    // --- Social Networks ---
    { id: "twitter", name: "Twitter / X" },
    { id: "facebook", name: "Facebook" },
    { id: "instagram", name: "Instagram" },
    { id: "tiktok", name: "TikTok" },
    { id: "snapchat", name: "Snapchat" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "pinterest", name: "Pinterest" },
    { id: "mastodon", name: "Mastodon" },
    { id: "bluesky", name: "Bluesky" },
    { id: "threads", name: "Threads" },

    // --- Video Platforms ---
    { id: "youtube", name: "YouTube" },
    { id: "twitch", name: "Twitch" },
    { id: "vimeo", name: "Vimeo" },
    { id: "rumble", name: "Rumble" },

    // --- Developer Platforms ---
    { id: "github", name: "GitHub" },
    { id: "gitlab", name: "GitLab" },
    { id: "bitbucket", name: "Bitbucket" },
    { id: "stack_overflow", name: "Stack Overflow" },
    { id: "stack_exchange", name: "Stack Exchange" },

    // --- Creative Platforms ---
    { id: "dribbble", name: "Dribbble" },
    { id: "behance", name: "Behance" },
    { id: "figma", name: "Figma Community" },
    { id: "deviantart", name: "DeviantArt" },
    { id: "artstation", name: "ArtStation" },

    // --- Writing / Publishing ---
    { id: "medium", name: "Medium" },
    { id: "substack", name: "Substack" },
    { id: "ghost", name: "Ghost" },
    { id: "wordpress", name: "WordPress" },
    { id: "hashnode", name: "Hashnode" },
    { id: "devto", name: "Dev.to" },

    // --- Community / Forums ---
    { id: "reddit", name: "Reddit" },
    { id: "hackernews", name: "Hacker News (Y Combinator)" },
    { id: "producthunt", name: "Product Hunt" },
    { id: "lemmy", name: "Lemmy" },
    { id: "discord", name: "Discord (public channels)" },
    { id: "slack", name: "Slack (public communities)" },
    { id: "telegram", name: "Telegram (public channels)" },

    // --- Audio / Podcasts ---
    { id: "spotify", name: "Spotify Podcasts" },
    { id: "apple_podcasts", name: "Apple Podcasts" },
    { id: "soundcloud", name: "SoundCloud" },

    // --- Q&A / Knowledge ---
    { id: "quora", name: "Quora" },
    { id: "wikihow", name: "WikiHow" },

    // --- Startup / Business ---
    { id: "indiehackers", name: "Indie Hackers" },
    { id: "angel_list", name: "AngelList" },

    // --- Decentralized / Web3 ---
    { id: "farcaster", name: "Farcaster" },
    { id: "lens", name: "Lens Protocol" },
  ];

  return NextResponse.json({ platforms });
}

/**
 * POST /api/platforms
 * Accepts platform configuration or connection data.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    return NextResponse.json({
      ok: true,
      received: body,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}