"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, Music, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { StripeProvider } from "./components/StripeProvider";
import { OrderSummary } from "./components/OrderSummary";
import {
  trackBeginCheckout,
  trackAddPaymentInfo,
  trackApplyPromotion,
  trackPurchase,
  trackDiscountCodeApplied,
  trackDiscountCodeFailed,
  trackPackageSelected,
  trackFormAbandoned,
  trackSongRequestViewed,
  trackPaymentInitiated,
  packageNames,
  type PackageType,
} from "@/lib/analytics";

type Step = "form" | "payment" | "processing";

interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  occasion: string;
  package: string;
  eventDate: string;
  storyDetails: string;
  mood: string;
  genre: string;
  additionalInfo: string;
  promoCode?: string;
}

const occasionOptions = [
  "Wedding",
  "Birthday",
  "Anniversary",
  "Retirement",
  "Graduation",
  "New Baby",
  "Corporate Event",
  "Poetry & Tribute",
  "Pet Tribute",
  "Other",
];

const packageOptions = [
  { value: "test_package", label: "Test Package - $1.00 (For testing payment flow only)", price: 1 },
  { value: "express", label: "Express Personal - $49 (24-48 hours)", price: 49 },
  { value: "standard", label: "Standard Occasion - $29 (3-5 days)", price: 29 },
  { value: "wedding", label: "Wedding Trio - $149 (5-7 days)", price: 149 },
];

const moodOptions = [
  "Romantic",
  "Upbeat & Celebratory",
  "Nostalgic & Reflective",
  "Fun & Playful",
  "Emotional & Heartfelt",
  "Inspiring & Uplifting",
];

const genreOptions = [
  "Pop",
  "Country",
  "Acoustic/Folk",
  "R&B/Soul",
  "Rock",
  "Jazz",
  "Classical/Orchestral",
  "Let Diamonds McFly decide",
];

function PaymentForm({
  orderId,
  finalPrice,
  packageType,
  discountAmount,
  promoCode,
  onPaymentSuccess,
}: {
  orderId: string;
  finalPrice: number;
  packageType: PackageType | null;
  discountAmount: number;
  promoCode: string | null;
  onPaymentSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Track payment_initiated when user submits payment form
    if (packageType) {
      trackPaymentInitiated({
        service_type: "custom_song",
        amount: finalPrice,
        currency: "AUD",
        booking_id: orderId,
      });
    }

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Please check your payment details");
        setIsProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/services/custom-songs/order/success?orderId=${orderId}`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed. Please try again.");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Track purchase event
        if (packageType) {
          trackPurchase(
            paymentIntent.id,
            [
              {
                item_id: packageType,
                item_name: packageNames[packageType] || packageType,
                price: finalPrice,
                quantity: 1,
              },
            ],
            finalPrice,
            discountAmount > 0 ? discountAmount : undefined,
            promoCode || undefined
          );
        }
        onPaymentSuccess(paymentIntent.id);
      } else {
        setError("Payment processing. Please wait...");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="bg-muted rounded-lg p-4 sm:p-6 border border-border">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive break-words">Payment Error</p>
            <p className="text-sm text-muted-foreground mt-1 break-words">{error}</p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-base sm:text-lg py-4 sm:py-6 min-h-[44px] sm:min-h-0 font-semibold"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span className="hidden sm:inline">Processing Payment...</span>
            <span className="sm:hidden">Processing...</span>
          </>
        ) : (
          `Pay $${finalPrice.toFixed(2)} AUD`
        )}
      </Button>
    </form>
  );
}

function CustomSongOrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("form");
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>("");
  const [promoError, setPromoError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  
  // Get package from URL parameter
  const packageParam = searchParams.get("package");
  const validPackages = ["standard", "express", "wedding"];
  const initialPackage = packageParam && validPackages.includes(packageParam) ? packageParam : "";
  
  const [formData, setFormData] = useState<OrderFormData>({
    name: "",
    email: "",
    phone: "",
    occasion: "",
    package: initialPackage,
    eventDate: "",
    storyDetails: "",
    mood: "",
    genre: "",
    additionalInfo: "",
    promoCode: "",
  });
  
  // Track song_request_viewed when component mounts
  useEffect(() => {
    trackSongRequestViewed();
  }, []);

  // Update package if URL parameter changes
  useEffect(() => {
    if (packageParam && validPackages.includes(packageParam) && formData.package !== packageParam) {
      setFormData((prev) => ({ ...prev, package: packageParam }));
    }
  }, [packageParam, formData.package]);

  // Track form abandonment
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Count completed fields
      const requiredFields = ['name', 'email', 'occasion', 'package', 'storyDetails'];
      const optionalFields = ['phone', 'eventDate', 'mood', 'genre', 'additionalInfo'];
      const totalFields = requiredFields.length + optionalFields.length;
      let completedFields = 0;

      requiredFields.forEach((field) => {
        if (formData[field as keyof OrderFormData]) completedFields++;
      });
      optionalFields.forEach((field) => {
        if (formData[field as keyof OrderFormData]) completedFields++;
      });

      if (completedFields > 0 && step === 'form') {
        trackFormAbandoned('order_form', completedFields, totalFields);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, step]);

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError("");
    // Clear promo error and applied code when user types (only if code was not successfully applied)
    if (field === "promoCode" && !appliedPromoCode) {
      setPromoError("");
    }
  };

  const handleApplyPromoCode = async () => {
    const code = formData.promoCode?.trim().toUpperCase() || "";
    if (!code) {
      setPromoError("Please enter a promo code");
      setAppliedPromoCode("");
      return;
    }

    setIsValidatingPromo(true);
    setPromoError("");

    // Simulate validation delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Case-insensitive validation
    if (code === "LAUNCH20") {
      setAppliedPromoCode("LAUNCH20");
      setPromoError("");
      
      // Track successful discount code application
      const discountAmount = basePrice * 0.2;
      trackDiscountCodeApplied("LAUNCH20", discountAmount);
      trackApplyPromotion("LAUNCH20", "LAUNCH20 - 20% Off", discountAmount);
    } else {
      setPromoError("Invalid promo code. Please check and try again.");
      setAppliedPromoCode("");
      
      // Track failed discount code attempt
      trackDiscountCodeFailed(code);
    }

    setIsValidatingPromo(false);
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode("");
    setPromoError("");
    setFormData((prev) => ({ ...prev, promoCode: "" }));
  };

  // Calculate pricing
  const selectedPackage = formData.package
    ? packageOptions.find((p) => p.value === formData.package)
    : null;
  const basePrice = selectedPackage?.price || 0;
  const discountApplied = appliedPromoCode === "LAUNCH20";
  const discountAmount = discountApplied ? basePrice * 0.2 : 0;
  const finalPrice = basePrice - discountAmount;

  // Track begin_checkout on page load or when package is selected
  useEffect(() => {
    if (selectedPackage && formData.package) {
      const packageType = formData.package as PackageType;
      trackBeginCheckout([
        {
          item_id: packageType,
          item_name: packageNames[packageType] || packageType,
          price: basePrice,
          quantity: 1,
        },
      ]);
    } else {
      trackBeginCheckout([]);
    }
  }, [formData.package, selectedPackage, basePrice]);

  // Track package selection
  useEffect(() => {
    if (formData.package && validPackages.includes(formData.package)) {
      const packageType = formData.package as PackageType;
      const packagePrice = selectedPackage?.price || 0;
      
      // Track custom event
      trackPackageSelected(packageType, packagePrice);
      
      // Track add_payment_info
      trackAddPaymentInfo(packageType, packagePrice);
    }
  }, [formData.package, selectedPackage]);

  // Check if form is ready for payment
  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.occasion &&
      formData.package &&
      formData.storyDetails
    );
  };

  const handleCreatePaymentIntent = async () => {
    if (!isFormValid()) {
      setFormError("Please fill in all required fields");
      return;
    }

    setIsCreatingIntent(true);
    setFormError("");

    try {
      const response = await fetch("/api/custom-songs/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          promoCode: appliedPromoCode || formData.promoCode,
        }),
      });

      const responseData = await response.json();

      // Handle withApiHandler wrapped response structure
      // Response format: { success: true, data: { ... }, requestId: "..." }
      if (responseData.success && responseData.data) {
        const data = responseData.data;
        if (data.success && data.clientSecret && data.orderId) {
          setOrderId(data.orderId);
          setClientSecret(data.clientSecret);
          setStep("payment");
        } else {
          setFormError(data.error || data.message || "Failed to initialize payment. Please try again.");
        }
      } else {
        // Handle error response from withApiHandler
        const errorMessage = responseData.error?.message || responseData.error?.code || "Failed to initialize payment. Please try again.";
        setFormError(errorMessage);
      }
    } catch (err) {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    router.push(`/services/custom-songs/order/success?orderId=${orderId}&paymentIntentId=${paymentIntentId}`);
  };

  if (step === "payment" && clientSecret) {
    return (
      <div className="min-h-screen bg-background py-8 sm:py-12 md:py-16">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Complete Your Payment
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground px-2">
              Secure payment powered by Stripe
            </p>
          </div>

          <div className="bg-card rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
              <div className="bg-muted rounded-lg p-6 border border-border">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {selectedPackage?.label.split(" - ")[0]}
                    </span>
                    <span className="font-semibold text-foreground">
                      ${basePrice.toFixed(2)}
                    </span>
                  </div>
                  
                  {discountApplied && (
                    <div className="flex justify-between items-center text-primary">
                      <span className="flex items-center gap-2">
                        <span>Discount (20% off)</span>
                        <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                          {appliedPromoCode}
                        </span>
                      </span>
                      <span className="font-semibold">
                        -${discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="font-semibold text-lg text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${finalPrice.toFixed(2)} AUD
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <StripeProvider clientSecret={clientSecret}>
              <PaymentForm
                orderId={orderId}
                finalPrice={finalPrice}
                packageType={formData.package as PackageType | null}
                discountAmount={discountAmount}
                promoCode={appliedPromoCode || null}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </StripeProvider>

            <div className="mt-4 sm:mt-6 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("form")}
                className="text-sm min-h-[44px] sm:min-h-0 w-full sm:w-auto px-6"
              >
                ← Back to Order Form
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 md:py-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Music className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Order Your Custom Song
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto px-2">
            Tell us about your special moment and we'll create a personalized song that captures your story perfectly.
          </p>
        </div>

        {/* Responsive Layout: Sidebar on desktop, stacked on mobile */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Form - Takes 2 columns on desktop */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreatePaymentIntent();
              }}
              className="bg-card rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8"
            >
          {/* Contact Information */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base">Full Name *</Label>
                <Input
                  id="name"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="text-base h-11 sm:h-9 min-h-[44px] sm:min-h-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="text-base h-11 sm:h-9 min-h-[44px] sm:min-h-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0400 000 000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="text-base h-11 sm:h-9 min-h-[44px] sm:min-h-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-sm sm:text-base">Event Date (if applicable)</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange("eventDate", e.target.value)}
                  className="text-base h-11 sm:h-9 min-h-[44px] sm:min-h-0"
                />
              </div>
            </div>
          </div>

          {/* Package Selection */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Select Your Package</h2>
            <div className="grid gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="package" className="text-sm sm:text-base">Package *</Label>
                <Select
                  value={formData.package}
                  onValueChange={(value) => handleInputChange("package", value)}
                  required
                >
                  <SelectTrigger id="package" className="text-base h-11 sm:h-9 min-h-[44px] sm:min-h-0 w-full">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    {packageOptions.map((pkg) => (
                      <SelectItem key={pkg.value} value={pkg.value} className="text-base py-3 sm:py-2">
                        <span className="break-words">{pkg.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="occasion" className="text-sm sm:text-base">Occasion Type *</Label>
                <Select
                  value={formData.occasion}
                  onValueChange={(value) => handleInputChange("occasion", value)}
                  required
                >
                  <SelectTrigger id="occasion" className="text-base h-11 sm:h-9 min-h-[44px] sm:min-h-0 w-full">
                    <SelectValue placeholder="What's the occasion?" />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    {occasionOptions.map((occasion) => (
                      <SelectItem key={occasion} value={occasion} className="text-base py-3 sm:py-2">
                        {occasion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Song Details */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Song Details</h2>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="mood" className="text-sm sm:text-base">Desired Mood</Label>
                <Select
                  value={formData.mood}
                  onValueChange={(value) => handleInputChange("mood", value)}
                >
                  <SelectTrigger id="mood" className="text-base h-11 sm:h-9 min-h-[44px] sm:min-h-0 w-full">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    {moodOptions.map((mood) => (
                      <SelectItem key={mood} value={mood} className="text-base py-3 sm:py-2">
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre" className="text-sm sm:text-base">Preferred Genre</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => handleInputChange("genre", value)}
                >
                  <SelectTrigger id="genre" className="text-base h-11 sm:h-9 min-h-[44px] sm:min-h-0 w-full">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    {genreOptions.map((genre) => (
                      <SelectItem key={genre} value={genre} className="text-base py-3 sm:py-2">
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storyDetails" className="text-sm sm:text-base">Your Story *</Label>
              <Textarea
                id="storyDetails"
                required
                placeholder="Tell us about the person or moment this song is for. Include names, special memories, inside jokes, or meaningful details you'd like incorporated into the lyrics..."
                rows={6}
                value={formData.storyDetails}
                onChange={(e) => handleInputChange("storyDetails", e.target.value)}
                className="text-base min-h-[120px] resize-y"
              />
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="additionalInfo" className="text-sm sm:text-base">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any other details, specific phrases to include, or things to avoid..."
                rows={3}
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                className="text-base min-h-[100px] resize-y"
              />
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="mb-6 sm:mb-8 border-t pt-4 sm:pt-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Promo Code</h2>
            <div
              className={`bg-card border rounded-lg p-3 sm:p-4 transition-colors duration-200 ${
                discountApplied
                  ? "border-primary"
                  : promoError
                  ? "border-destructive"
                  : "border-border"
              }`}
            >
              <Label htmlFor="promoCode" className="text-sm sm:text-base font-medium text-foreground mb-2 block">
                Promo Code (optional)
              </Label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <div className="flex-1 relative">
                  <Input
                    id="promoCode"
                    placeholder="Enter promo code"
                    value={formData.promoCode || ""}
                    onChange={(e) => handleInputChange("promoCode", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !discountApplied) {
                        e.preventDefault();
                        handleApplyPromoCode();
                      }
                    }}
                    disabled={discountApplied}
                    className={`flex-1 transition-colors duration-200 text-base h-11 sm:h-9 min-h-[44px] sm:min-h-0 ${
                      discountApplied
                        ? "border-primary bg-primary/10 pr-10"
                        : promoError
                        ? "border-destructive bg-destructive/10"
                        : ""
                    }`}
                    aria-invalid={!!promoError}
                  />
                  {discountApplied && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  )}
                </div>
                {!discountApplied && (
                  <Button
                    type="button"
                    onClick={handleApplyPromoCode}
                    disabled={isValidatingPromo || !formData.promoCode?.trim()}
                    className="w-full sm:w-auto whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px] sm:min-h-0 text-base sm:text-sm"
                  >
                    {isValidatingPromo ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Validating...</span>
                        <span className="sm:hidden">Validating</span>
                      </>
                    ) : (
                      "Apply"
                    )}
                  </Button>
                )}
              </div>

              {/* Success Message */}
              {discountApplied && (
                <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground break-words">
                          Discount applied! Code: {appliedPromoCode}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 break-words">
                          Save ${discountAmount.toFixed(2)} (20% off)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromoCode}
                      className="text-sm text-primary hover:text-primary underline font-medium self-start sm:self-auto min-h-[44px] sm:min-h-0 px-2 sm:px-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {promoError && !discountApplied && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Invalid Code</p>
                    <p className="text-sm text-muted-foreground mt-1">{promoError}</p>
                  </div>
                </div>
              )}

              {/* Helper Text */}
              {!discountApplied && !promoError && !formData.promoCode && (
                <div className="mt-2 text-muted-foreground text-sm">
                  Enter "LAUNCH20" for 20% off your order
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-muted-foreground mt-1">{formError}</p>
              </div>
            </div>
          )}

          {/* Terms & Submit */}
          <div className="border-t pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              By proceeding to payment, you agree to our{" "}
              <Link href="/services/custom-songs/terms" className="text-primary hover:underline break-words">
                Terms & Conditions
              </Link>{" "}
              and acknowledge that songs are created using Suno AI technology with human creative direction by Diamonds McFly.
            </p>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-base sm:text-lg py-4 sm:py-6 min-h-[44px] sm:min-h-0 font-semibold"
              disabled={isCreatingIntent || !isFormValid()}
            >
              {isCreatingIntent ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span className="hidden sm:inline">Preparing Payment...</span>
                  <span className="sm:hidden">Preparing...</span>
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </div>
        </form>

            {/* AI Transparency Notice */}
            <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground px-2">
              <p className="break-words">
                Our songs are created using Suno AI technology with human creative direction and curation by Diamonds McFly.
              </p>
            </div>
          </div>

          {/* Order Summary Sidebar - Sticky on desktop, below form on mobile */}
          <div className="lg:col-span-1 order-2 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <OrderSummary
                selectedPackage={selectedPackage ? {
                  value: selectedPackage.value,
                  name: selectedPackage.label.split(" - ")[0] || selectedPackage.value,
                  price: selectedPackage.price,
                  format: selectedPackage.value === "standard" ? "MP3 + Lyric Sheet" : 
                          selectedPackage.value === "express" ? "MP3 format" : 
                          "MP3 + WAV formats",
                  revisions: selectedPackage.value === "standard" ? "2 revision rounds" : 
                            selectedPackage.value === "express" ? "1 revision round" : 
                            "3 revision rounds",
                  deliveryTime: selectedPackage.value === "standard" ? "3-5 days" : 
                               selectedPackage.value === "express" ? "24-48 hours" : 
                               "5-7 days",
                } : null}
                discountApplied={discountApplied}
                discountAmount={discountAmount}
                finalPrice={finalPrice}
                appliedPromoCode={appliedPromoCode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomSongOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order form...</p>
          </div>
        </div>
      }
    >
      <CustomSongOrderPageContent />
    </Suspense>
  );
}
