//components\PayPalCheckout.tsx

"use client";

import { PayPalScriptProvider, PayPalButtons, ReactPayPalScriptOptions } from "@paypal/react-paypal-js";

type PayPalCheckoutProps = {
  plan: string;
  amount: string;
};

export default function PayPalCheckout({ plan, amount }: PayPalCheckoutProps) {
  // ✅ satisfy TS with clientId, SDK runtime with "client-id"
  const initialOptions: ReactPayPalScriptOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, // satisfies TypeScript
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, // required by SDK runtime
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={async () => {
          const formattedAmount = parseFloat(amount).toFixed(2); // 2 decimals

          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan, amount: formattedAmount }),
          });

          const data = await res.json();

          if (!data.id) {
            console.error("No order ID returned from create-order API:", data);
            throw new Error("PayPal order creation failed");
          }

          return data.id; // order ID for popup
        }}
        onApprove={async (data) => {
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          });

          const capture = await res.json();

          if (capture.status === "COMPLETED") {
            alert("Payment successful! Activate SaaS access here.");
          } else {
            alert("Payment failed or pending.");
            console.error("Capture details:", capture);
          }
        }}
      />
    </PayPalScriptProvider>
  );
}
