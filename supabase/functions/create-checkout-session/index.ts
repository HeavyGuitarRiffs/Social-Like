//supabase\functions\create-checkout-session\index.ts

import Stripe from "npm:stripe@12.0.0";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Validate required environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
if (!STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in Supabase secrets");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

serve(async (req: Request): Promise<Response> => {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse JSON safely
    let payload;
    try {
      payload = await req.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const { userId, priceId, plan } = payload;

    // Validate required fields
    if (!userId || !priceId || !plan) {
      return new Response(
        JSON.stringify({ error: "Missing userId, priceId, or plan" }),
        { status: 400 }
      );
    }

    // Determine origin (fallback for local dev)
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?status=cancelled`,
      metadata: {
        userId,
        plan,
      },
    });

    // Return the session URL
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Checkout session error:", err);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
});