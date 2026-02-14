//components\PayPalCardFields.tsx

"use client";

import {
  PayPalHostedFieldsProvider,
  PayPalHostedField,
  usePayPalHostedFields,
} from "@paypal/react-paypal-js";
import { useState } from "react";

export default function PayPalCardFields({ plan, amount }: { plan: string; amount: string }) {
  // PayPal requires createOrder at the provider level
  async function createOrder() {
    const formattedAmount = parseFloat(amount).toFixed(2);

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

    return data.id;
  }

  return (
    <PayPalHostedFieldsProvider
      createOrder={createOrder}
      styles={{
        ".valid": { color: "green" },
        ".invalid": { color: "red" },
      }}
    >
      <CardFieldsInner />
    </PayPalHostedFieldsProvider>
  );
}

function CardFieldsInner() {
  const hostedFields = usePayPalHostedFields();
  const [loading, setLoading] = useState(false);

  async function handleCardPay() {
    if (!hostedFields?.cardFields) {
      console.error("Hosted Fields not ready");
      return;
    }

    try {
      setLoading(true);

      // 1. Submit card fields (this triggers 3D Secure if required)
      const submitResult = await hostedFields.cardFields.submit({
        contingencies: ["3D_SECURE"],
      });

      const orderID = submitResult.orderId;
      if (!orderID) throw new Error("Order ID missing after Hosted Fields submit");

      // 2. Capture order
      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID }),
      });

      const capture = await captureRes.json();

      if (capture.status === "COMPLETED") {
        alert("Card payment successful!");
      } else {
        alert("Card payment failed or pending.");
        console.error("Capture details:", capture);
      }
    } catch (err) {
      console.error("Card payment error:", err);
      alert("Card payment failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-md bg-white">
      <PayPalHostedField
        id="card-number"
        hostedFieldType="number"
        options={{ selector: "#card-number", placeholder: "Card Number" }}
      />
      <PayPalHostedField
        id="cvv"
        hostedFieldType="cvv"
        options={{ selector: "#cvv", placeholder: "CVV" }}
      />
      <PayPalHostedField
        id="expiration-date"
        hostedFieldType="expirationDate"
        options={{ selector: "#expiration-date", placeholder: "MM/YY" }}
      />

      <button
        onClick={handleCardPay}
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded-md"
      >
        {loading ? "Processing..." : "Pay with Card"}
      </button>
    </div>
  );
}