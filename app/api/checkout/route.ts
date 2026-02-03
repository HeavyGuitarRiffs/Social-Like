import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { priceId, userId, plan } = await req.json();

    if (!priceId || !userId || !plan) {
      return NextResponse.json(
        { error: "Missing priceId, userId, or plan" },
        { status: 400 }
      );
    }

    const endpoint = `${process.env.SUPABASE_URL}/functions/v1/create-checkout-session`;

    const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({ priceId, userId, plan }),
});

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: "Edge function error", details: errorText },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown server error";

    return NextResponse.json(
      { error: "Unexpected server error", details: message },
      { status: 500 }
    );
  }
}