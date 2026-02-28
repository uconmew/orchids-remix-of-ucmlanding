"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ReactNode } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
  amount?: number;
  mode?: "payment" | "subscription";
}

export function StripeProvider({
  children,
  clientSecret,
  amount,
  mode = "payment",
}: StripeProviderProps) {
  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: "#A92FFA",
            colorBackground: "#ffffff",
            colorText: "#1a1a1a",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "8px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            },
            ".Input:focus": {
              border: "1px solid #A92FFA",
              boxShadow: "0 0 0 3px rgba(169, 47, 250, 0.1)",
            },
            ".Label": {
              fontWeight: "500",
            },
          },
        },
      }
    : {
        mode: mode as "payment" | "subscription" | "setup",
        amount: amount || 5000,
        currency: "usd",
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: "#A92FFA",
            colorBackground: "#ffffff",
            colorText: "#1a1a1a",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "8px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            },
            ".Input:focus": {
              border: "1px solid #A92FFA",
              boxShadow: "0 0 0 3px rgba(169, 47, 250, 0.1)",
            },
            ".Label": {
              fontWeight: "500",
            },
          },
        },
      };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
