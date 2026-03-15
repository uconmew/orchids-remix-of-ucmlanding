"use client";

import { useState, useEffect } from "react";
import { StripeProvider } from "./StripeProvider";
import { PaymentForm } from "./PaymentForm";
import { Loader2 } from "lucide-react";

interface DonationCheckoutProps {
  amount: number;
  email: string;
  name: string;
  isAnonymous: boolean;
  donationType: "one_time" | "recurring";
  interval?: "month" | "year";
  tier?: string;
  message?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onBack: () => void;
}

export function DonationCheckout({
  amount,
  email,
  name,
  isAnonymous,
  donationType,
  interval = "month",
  tier,
  message,
  onSuccess,
  onError,
  onBack,
}: DonationCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint =
          donationType === "recurring"
            ? "/api/donations/subscription"
            : "/api/donations/payment-intent";

        const body: Record<string, unknown> = {
          amount,
          email,
          name,
          isAnonymous,
          tier,
        };

        if (donationType === "recurring") {
          body.interval = interval;
        }
        if (message) {
          body.message = message;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to initialize payment");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);

        if (donationType === "recurring") {
          setSubscriptionId(data.subscriptionId);
        } else {
          setPaymentIntentId(data.paymentIntentId);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to initialize payment";
        setError(message);
        onError(message);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, email, name, isAnonymous, donationType, interval, tier, message, onError]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#A92FFA] animate-spin mb-4" />
        <p className="text-muted-foreground">Preparing secure payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
        <button
          onClick={onBack}
          className="text-[#A92FFA] hover:underline font-medium"
        >
          Go back and try again
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Unable to initialize payment. Please try again.
        </p>
        <button
          onClick={onBack}
          className="text-[#A92FFA] hover:underline font-medium mt-4"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <PaymentForm
        amount={amount}
        donationType={donationType}
        paymentIntentId={paymentIntentId || undefined}
        subscriptionId={subscriptionId || undefined}
        onSuccess={onSuccess}
        onError={onError}
      />
      <button
        onClick={onBack}
        className="w-full mt-4 text-center text-muted-foreground hover:text-foreground text-sm"
      >
        ← Back to donation options
      </button>
    </StripeProvider>
  );
}
