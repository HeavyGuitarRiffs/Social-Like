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
    console.error("❌ [CREATE ORDER] Failed to get access token:", data);
    throw new Error("Failed to get PayPal access token");
  }

  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { plan, amount } = await req.json();

    console.log("📦 [CREATE ORDER] Incoming:", { plan, amount });

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
          brand_name: "My SaaS App",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
        },
      }),
    });

    const orderData = await orderRes.json();

    console.log("📦 [CREATE ORDER] PayPal response:", orderData);

    if (!orderData.id) {
      console.error("❌ [CREATE ORDER] Failed:", orderData);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    console.log("📦 [CREATE ORDER] SUCCESS:", { orderID: orderData.id });

    return NextResponse.json({ id: orderData.id });
  } catch (err) {
    console.error("❌ [CREATE ORDER] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}