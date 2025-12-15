"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ReactNode } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface StripeProviderProps {
  children: ReactNode;
  clientSecret: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  if (!publishableKey) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">
        <p className="font-semibold">Payment Configuration Error</p>
        <p className="text-sm mt-1">
          Stripe publishable key is not configured. Please contact support.
        </p>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="bg-muted border border-border rounded-lg p-4 text-foreground">
        <p className="font-semibold">Loading Payment System...</p>
        <p className="text-sm mt-1 text-muted-foreground">
          Please wait while we initialize the payment form.
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "var(--primary)",
            colorBackground: "var(--background)",
            colorText: "var(--foreground)",
            colorDanger: "var(--destructive)",
            fontFamily: "system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "8px",
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}

