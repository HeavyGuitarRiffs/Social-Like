//components\PayPalCheckout.tsx

"use client";

import {
  PayPalScriptProvider,
  PayPalButtons,
  ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import PayPalCardFields from "./PayPalCardFields";

type PayPalCheckoutProps = {
  plan: string;
  amount: string;
};

export default function PayPalCheckout({ plan, amount }: PayPalCheckoutProps) {
  const initialOptions: ReactPayPalScriptOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: "USD",
    intent: "capture",
    components: "buttons,hosted-fields",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="space-y-6">
        {/* PayPal Button */}
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
            if (!data.id) throw new Error("PayPal order creation failed");

            return data.id;
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID }),
            });

            const capture = await res.json();

            if (capture.status === "COMPLETED") {
              alert("PayPal payment successful!");
            } else {
              alert("Payment failed or pending.");
            }
          }}
        />

        {/* Card Fields */}
        <PayPalCardFields plan={plan} amount={amount} />
      </div>
    </PayPalScriptProvider>
  );
}