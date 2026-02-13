// app/api/paypal/create-order/route.ts
import { NextResponse } from "next/server";

const PAYPAL_API =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Get OAuth2 access token from PayPal
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();

  if (!data.access_token) {
    throw new Error("Failed to get PayPal access token");
  }

  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { plan, amount } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
            description: plan || "SaaS subscription",
            custom_id: `plan_${plan || "unknown"}`,
            invoice_id: `${plan || "plan"}-${Date.now()}`,
          },
        ],
        application_context: {
          brand_name: "My SaaS App",           // optional branding
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",             // encourages card payment flow
          shipping_preference: "NO_SHIPPING", // digital product, no shipping
        },
      }),
    });

    const orderData = await orderRes.json();

    if (!orderData.id) {
      console.error("PayPal order error:", orderData);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json({ id: orderData.id });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
