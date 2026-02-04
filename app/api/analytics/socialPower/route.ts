// app/api/analytics/socialPower/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("social_power_level")
      .select("*")
      .eq("user_id", user_id);

    if (error) throw error;

    return NextResponse.json({ power_level: data });
  } catch (err: unknown) {
    if (err instanceof Error) {
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