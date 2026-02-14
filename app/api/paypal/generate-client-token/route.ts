import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const secret = process.env.PAYPAL_SECRET!;

    const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

    const res = await fetch(
      `${process.env.PAYPAL_ENV === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com"
      }/v1/identity/generate-token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!data.client_token) {
      console.error("Failed to generate client token:", data);
      return NextResponse.json({ error: "Failed to generate client token" }, { status: 500 });
    }

    return NextResponse.json({ clientToken: data.client_token });
  } catch (err) {
    console.error("Client token error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}