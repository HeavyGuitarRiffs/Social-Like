// /app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getPlanFromPriceId, calculateExpiry } from "@/lib/paywall";

export const runtime = "nodejs";

// Stripe client — no apiVersion needed
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Supabase service role client (required for webhooks)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new NextResponse(`Webhook Error: ${err}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerId = session.customer as string;
    const priceId = session.metadata?.price_id ?? null;

    if (!priceId) {
      console.error("Missing priceId in session metadata");
      return NextResponse.json({ received: true });
    }

    const plan = getPlanFromPriceId(priceId);
    const expires_at = calculateExpiry(plan);

    // Find subscription row by stripe_customer_id
    const { data: existing } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (!existing) {
      console.error("No user found for stripe_customer_id:", customerId);
      return NextResponse.json({ received: true });
    }

    await supabase.from("user_subscriptions").upsert({
      user_id: existing.user_id,
      plan,
      status: "active",
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      expires_at,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}