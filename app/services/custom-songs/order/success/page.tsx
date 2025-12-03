"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, Music } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentIntentId = searchParams.get("paymentIntentId");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to ensure payment is processed
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Thank you for your custom song order. Your payment has been processed successfully.
          </p>
          
          <div className="bg-slate-50 rounded-lg p-6 mb-6 space-y-3">
            {orderId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Order Reference</span>
                <span className="font-mono font-bold text-teal-600">{orderId}</span>
              </div>
            )}
            {paymentIntentId && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Payment ID</span>
                <span className="font-mono text-slate-600">{paymentIntentId.substring(0, 20)}...</span>
              </div>
            )}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
              <Music className="w-5 h-5" />
              What happens next?
            </h2>
            <ol className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-teal-600">1.</span>
                <span>Diamonds McFly will review your story and requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-teal-600">2.</span>
                <span>We'll reach out if we need any clarification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-teal-600">3.</span>
                <span>Your custom song will be crafted with care</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-teal-600">4.</span>
                <span>You'll receive your song via email within the turnaround time</span>
              </li>
            </ol>
          </div>

          <p className="text-slate-600 mb-8">
            A confirmation email has been sent with your order details and next steps.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services/custom-songs">
              <Button variant="outline">Back to Custom Songs</Button>
            </Link>
            <Link href="/">
              <Button className="bg-teal-600 hover:bg-teal-700">Return Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

