"use client";

import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { CheckCircle, Loader2, Calendar, User, FileCheck } from "lucide-react";
import {
  validateAustralianPhone,
  formatToE164,
  formatForDisplay,
} from "@/lib/phone";
import { BookingCalendar } from "@/app/components/BookingCalendar";
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
import BookingConfirmation, { SmsStatus } from "@/components/BookingConfirmation";
import {
  trackBookingStarted,
  trackBookingCompleted,
} from "@/lib/analytics";

type Step = "calendar" | "details" | "confirmation";

interface FormData {
  serviceType: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  smsOptIn: boolean;
}

interface BookingResponse {
  success: boolean;
  bookingId: string;
  message?: string;
  error?: string;
}

const serviceOptions = [
  "Website Consultation (1 hour)",
  "Website Audit (1 hour)",
  "Project Discovery Call (1 hour)",
  "Follow-up Meeting (30 min)",
];

export default function BookPage() {
  const [step, setStep] = useState<Step>("calendar");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    serviceType: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    smsOptIn: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [bookingId, setBookingId] = useState<string>("");
  const [smsStatus, setSmsStatus] = useState<SmsStatus>("idle");
  const [smsError, setSmsError] = useState<string>("");

  // Pre-fill form from URL parameters (from email link)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prefillName = params.get("name");
      const prefillEmail = params.get("email");
      const prefillBusiness = params.get("business");
      
      if (prefillName || prefillEmail) {
        setFormData((prev) => ({
          ...prev,
          name: prefillName || prev.name,
          email: prefillEmail || prev.email,
          message: prefillBusiness 
            ? `Following up on questionnaire submission for ${prefillBusiness}`
            : prev.message,
        }));
      }
    }
  }, []);

  // Track booking_started when component mounts
  useEffect(() => {
    trackBookingStarted();
  }, []);

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    // Only move to details step when both date AND time are selected
    // (time slot was clicked)
    if (date && time) {
      setStep("details");
    }
    // If only date is selected (no time), stay on calendar step
    // This allows user to see time slots before selecting one
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.serviceType) {
      setError("Please select a service type");
      return false;
    }
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    // Validate Australian phone number using libphonenumber-js
    if (!validateAustralianPhone(formData.phone.trim())) {
      setError("Please enter a valid Australian phone number (e.g., +61412345678 or 0412345678)");
      return false;
    }
    return true;
  };

  const sendSmsNotification = async (formattedPhone: string) => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    setSmsStatus("sending");
    setSmsError("");

    const payload = {
      to: formattedPhone,
      customerName: formData.name,
      date: selectedDate,
      time: selectedTime,
      service: formData.serviceType,
    };

    try {
      console.log("[SMS] Attempting SMS notification", payload);

      const response = await fetch("/api/notifications/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("SMS API error:", errorText);
        throw new Error(`SMS failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("SMS sent successfully:", data);

      setSmsStatus("success");
    } catch (err: unknown) {
      setSmsStatus("error");
      const message = err instanceof Error ? err.message : "Unknown error";
      setSmsError(message);
      console.error("SMS notification exception", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time");
      return;
    }

    setLoading(true);

    try {
      // Format phone number to E.164 before sending to API
      const formattedPhone = formatToE164(formData.phone.trim());

      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          name: formData.name,
          email: formData.email,
          phone: formattedPhone,
          serviceType: formData.serviceType,
          message: formData.message || "",
          smsOptIn: formData.smsOptIn,
        }),
      });

      const data: BookingResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success && data.bookingId) {
        setBookingId(data.bookingId);
        
        // Track booking_completed event
        trackBookingCompleted({
          service_type: formData.serviceType,
          date: selectedDate,
          time: selectedTime,
          booking_id: data.bookingId,
        });

        if (formData.smsOptIn) {
          await sendSmsNotification(formattedPhone);
        }
        setStep("confirmation");
      } else {
        throw new Error(data.error || "Booking creation failed");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(
        err?.message || "Failed to create booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTimeDisplay = (time: string): string => {
    const [hours] = time.split(":");
    if (!hours) return time;
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const steps = [
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "details", label: "Details", icon: User },
    { id: "confirmation", label: "Confirmation", icon: FileCheck },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Book a Consultation
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Schedule a meeting with Rocky Web Studio
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = step === stepItem.id;
              const isCompleted =
                (step === "details" && index === 0) ||
                (step === "confirmation" && index < 2);

              return (
                <div key={stepItem.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="h-6 w-6" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive
                          ? "text-primary"
                          : isCompleted
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stepItem.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 w-16 ${
                        isCompleted ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-card p-6 shadow-xl sm:p-8 md:p-10">
          {/* Step 1: Calendar */}
          {step === "calendar" && (
            <div>
              <BookingCalendar
                onDateTimeSelect={handleDateTimeSelect}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            </div>
          )}

          {/* Step 2: Details Form */}
          {step === "details" && (
            <div className="space-y-6">
              {/* Selected Date/Time Display */}
              {selectedDate && selectedTime && (
                <div className="rounded-lg border-2 border-primary/20 bg-primary/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Selected Date & Time
                      </p>
                      <p className="mt-1 text-base text-primary">
                        {format(
                          parse(selectedDate, "yyyy-MM-dd", new Date()),
                          "EEEE, MMMM d, yyyy"
                        )}{" "}
                        at {formatTimeDisplay(selectedTime)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStep("calendar");
                        setSelectedTime("");
                        // Keep the date selected, just clear time so user can pick again
                      }}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      Change date/time
                    </Button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="rounded-lg border-2 border-destructive/30 bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Type */}
                <div className="space-y-2">
                  <Label htmlFor="serviceType" className="text-foreground">
                    Service Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) =>
                      handleInputChange("serviceType", value)
                    }
                  >
                    <SelectTrigger
                      id="serviceType"
                      className="w-full"
                      aria-invalid={error.includes("service type")}
                    >
                      <SelectValue placeholder="Select a service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="John Doe"
                    required
                    aria-invalid={error.includes("name")}
                    className="w-full"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      handleInputChange("email", e.target.value)
                    }
                    placeholder="john@example.com"
                    required
                    aria-invalid={error.includes("email")}
                    className="w-full"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value)
                    }
                    placeholder="+61412345678 or 0412345678"
                    required
                    aria-invalid={error.includes("phone")}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Australian mobile number (any format accepted)
                  </p>
                </div>

                {/* SMS Opt-in */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-4">
                  <input
                    type="checkbox"
                    id="smsOptIn"
                    checked={formData.smsOptIn}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        smsOptIn: e.target.checked,
                      }));
                    }}
                    className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="smsOptIn"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Send SMS confirmations and reminders
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Receive booking confirmation and reminder texts. You can opt out anytime by replying STOP.
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">
                    Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="Tell us about your project or any specific topics you'd like to discuss..."
                    rows={4}
                    className="w-full resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("calendar")}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirmation" && bookingId && (
            <div className="space-y-8 text-center">
              {/* Success Icon */}
              <div className="flex justify-center">
                <CheckCircle className="h-20 w-20 text-primary" />
              </div>

              {/* Heading */}
              <div>
                <h2 className="text-3xl font-bold text-primary">
                  Booking Confirmed!
                </h2>
                <p className="mt-4 text-base text-muted-foreground">
                  Your consultation has been booked successfully. We'll contact you shortly to confirm.
                </p>
              </div>

              {/* Success Banner */}
              <div className="mx-auto max-w-2xl rounded-lg border border-primary/20 bg-primary/10 p-4">
                <p className="text-sm font-medium text-foreground">
                  ✓ Your booking has been received and confirmed
                </p>
              </div>

              <BookingConfirmation
                smsOptIn={formData.smsOptIn}
                phone={formData.phone}
                customerName={formData.name}
                date={selectedDate || ""}
                time={selectedTime || ""}
                service={formData.serviceType}
                smsStatus={smsStatus}
                smsError={smsError}
              />

              {/* Booking Details Card */}
              <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-8 shadow-lg text-left">
                <h3 className="mb-6 text-xl font-semibold text-foreground">
                  Booking Details
                </h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Booking ID
                    </dt>
                    <dd className="mt-1 font-mono text-base font-semibold text-primary">
                      {bookingId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                    <dd className="mt-1 text-base text-foreground">
                      {format(
                        parse(selectedDate, "yyyy-MM-dd", new Date()),
                        "EEEE, MMMM d, yyyy"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Time</dt>
                    <dd className="mt-1 text-base text-foreground">
                      {formatTimeDisplay(selectedTime)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Service Type
                    </dt>
                    <dd className="mt-1 text-base text-foreground">
                      {formData.serviceType}
                    </dd>
                  </div>
                  <div className="border-t border-border pt-4">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Your Name
                    </dt>
                    <dd className="mt-1 text-base text-foreground">
                      {formData.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Your Email
                    </dt>
                    <dd className="mt-1 text-base text-foreground">
                      {formData.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Your Phone
                    </dt>
                    <dd className="mt-1 text-base text-foreground">
                      {formatForDisplay(formData.phone)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  onClick={() => {
                    setStep("calendar");
                    setSelectedDate("");
                    setSelectedTime("");
                    setBookingId("");
                    setFormData({
                      serviceType: "",
                      name: "",
                      email: "",
                      phone: "",
                      message: "",
                      smsOptIn: false,
                    });
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Book Another Consultation
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-border text-foreground hover:bg-muted"
                >
                  <a href="/">Return to Home</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

