//components\PayPalCheckout.tsx

"use client";

import {
  PayPalScriptProvider,
  PayPalButtons,
  ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import PayPalCardFields from "./PayPalCardFields";
import { useEffect, useState } from "react";

type PayPalCheckoutProps = {
  plan: string;
  amount: string;
};

export default function PayPalCheckout({ plan, amount }: PayPalCheckoutProps) {
  const [clientToken, setClientToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      const res = await fetch("/api/paypal/generate-client-token", { method: "POST" });
      const data = await res.json();
      setClientToken(data.clientToken);
    }
    fetchToken();
  }, []);

  if (!clientToken) return <div>Loading payment options…</div>;

  const initialOptions: ReactPayPalScriptOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: "USD",
    intent: "capture",
    components: "buttons,hosted-fields",
    dataClientToken: clientToken,
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="space-y-6">
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={async () => {
            const formattedAmount = parseFloat(amount).toFixed(2);

            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan, amount: formattedAmount }),
            });

            const data = await res.json();
            return data.id;
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID }),
            });

            const capture = await res.json();
            alert(
              capture.status === "COMPLETED"
                ? "PayPal payment successful!"
                : "Payment failed."
            );
          }}
        />

        <PayPalCardFields plan={plan} amount={amount} />
      </div>
    </PayPalScriptProvider>
  );
}