// app/api/paypal/generate-client-token/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("🔑 [CLIENT TOKEN] Generating client token...");

    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const secret = process.env.PAYPAL_SECRET!;
    const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

    const baseUrl =
      process.env.PAYPAL_ENV === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const res = await fetch(`${baseUrl}/v1/identity/generate-token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!data.client_token) {
      console.error("❌ [CLIENT TOKEN] Failed to generate:", data);
      return NextResponse.json({ error: "Failed to generate client token" }, { status: 500 });
    }

    console.log("🔑 [CLIENT TOKEN] Token generated successfully");
    return NextResponse.json({ clientToken: data.client_token });
  } catch (err) {
    console.error("❌ [CLIENT TOKEN] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}