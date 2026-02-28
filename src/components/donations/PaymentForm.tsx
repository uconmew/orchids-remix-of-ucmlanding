"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CircleCheck, AlertCircle } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  donationType: "one_time" | "recurring";
  paymentIntentId?: string;
  subscriptionId?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PaymentForm({
  amount,
  donationType,
  paymentIntentId,
  subscriptionId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "An error occurred");
        onError(submitError.message || "An error occurred");
        setIsLoading(false);
        return;
      }

      let result;
      
      if (donationType === "recurring") {
        result = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/donations?success=true`,
          },
          redirect: "if_required",
        });
      } else {
        result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/donations?success=true`,
          },
          redirect: "if_required",
        });
      }

      if (result.error) {
        setErrorMessage(result.error.message || "Payment failed");
        onError(result.error.message || "Payment failed");
        setIsLoading(false);
        return;
      }

      const isSuccess = 
        ('paymentIntent' in result && result.paymentIntent?.status === "succeeded") ||
        ('setupIntent' in result && result.setupIntent?.status === "succeeded");

      if (isSuccess || ('paymentIntent' in result && result.paymentIntent?.status === "processing")) {
        await fetch("/api/donations/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: 'paymentIntent' in result ? result.paymentIntent?.id : undefined,
            subscriptionId,
          }),
        });

        setIsComplete(true);
        onSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CircleCheck className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-600 mb-2">
          Thank You for Your Generosity!
        </h3>
        <p className="text-muted-foreground">
          Your {donationType === "recurring" ? "recurring " : ""}donation of $
          {(amount / 100).toFixed(2)} has been processed successfully.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          A confirmation email has been sent to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg mb-4">
        <p className="text-sm text-muted-foreground">
          {donationType === "recurring" ? "Monthly donation" : "One-time gift"}:{" "}
          <span className="font-semibold text-foreground">
            ${(amount / 100).toFixed(2)}
            {donationType === "recurring" ? "/month" : ""}
          </span>
        </p>
      </div>

      <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "apple_pay", "google_pay"],
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90 text-white py-6 text-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Donate ${(amount / 100).toFixed(2)}
            {donationType === "recurring" ? "/month" : ""}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secured by Stripe. UCon Ministries is a 501(c)(3)
        nonprofit. Your donation is tax-deductible.
      </p>
    </form>
  );
}