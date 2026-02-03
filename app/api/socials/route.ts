// app/api/socials/route.ts
import { NextResponse } from "next/server";

/**
 * GET /api/socials
 * Returns a placeholder list of connected socials (for now).
 * Later, you can wire this up to Supabase.
 */
export async function GET() {
  // For now, return a static example structure.
  // Later, you'll fetch this from Supabase (e.g. socials_connections table).
  const socials = [
    {
      id: "twitter",
      handle: "@your_handle",
      connected: false,
    },
    {
      id: "instagram",
      handle: "@your_handle",
      connected: false,
    },
    {
      id: "github",
      handle: "your-username",
      connected: false,
    },
  ];

  return NextResponse.json({ socials });
}

/**
 * POST /api/socials
 * Accepts data to create/update a social connection.
 * This is where you'll later plug in Supabase inserts/updates.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Example expected shape:
    // { platform: "twitter", handle: "@name", connected: true }

    // In the future:
    // const supabase = createClient();
    // await supabase.from("social_connections").upsert(body);

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