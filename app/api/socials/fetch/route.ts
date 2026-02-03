// app/api/socials/fetch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("user_socials")
      .select("*")
      .eq("user_id", user_id);

    if (error) throw error;

    return NextResponse.json({ socials: data });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Fetch socials error:", err.message);
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unknown error" },
      { status: 500 }
    );
  }
}