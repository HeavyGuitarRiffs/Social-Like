//app\api\paypal\capture-order\route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client"; // optional: your DB

// Map plan keys to expected amounts (match your tiers)
const PLAN_PRICES: Record<string, string> = {
  monthly: "9.00",
  quarterly: "29.00",
  semiannual: "75.00",
  lifetime: "149.00",
};

export async function POST(req: Request) {
  try {
    const { orderID, plan } = await req.json();

    if (!orderID || !plan) {
      return NextResponse.json({ error: "Missing orderID or plan" }, { status: 400 });
    }

    const baseUrl =
      process.env.PAYPAL_ENV === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();

    // ✅ Verify payment completed
    if (data.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed", data }, { status: 400 });
    }

    // ✅ Verify amount matches the plan
    const captureAmount = data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
    const expectedAmount = PLAN_PRICES[plan];

    if (captureAmount !== expectedAmount) {
      return NextResponse.json(
        { error: "Captured amount does not match plan", captureAmount, expectedAmount },
        { status: 400 }
      );
    }

    // ✅ Activate SaaS access here
    const supabase = createClient();
    // Example: record subscription/payment in your DB
    /*
    const { error } = await supabase.from("subscriptions").insert([
      {
        user_id: "USER_ID_HERE", // pass from frontend / JWT
        plan,
        amount: captureAmount,
        order_id: orderID,
        status: "active",
      },
    ]);
    if (error) throw error;
    */

    return NextResponse.json({ status: "COMPLETED", plan, amount: captureAmount });
  } catch (err) {
    console.error("Capture order error:", err);
    return NextResponse.json({ error: "Failed to capture order" }, { status: 500 });
  }
}
