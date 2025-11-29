"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Music } from "lucide-react";
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

type Step = "form" | "confirmation";

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
}

interface OrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  error?: string;
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

export default function CustomSongOrderPage() {
  const [step, setStep] = useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [formData, setFormData] = useState<OrderFormData>({
    name: "",
    email: "",
    phone: "",
    occasion: "",
    package: "",
    eventDate: "",
    storyDetails: "",
    mood: "",
    genre: "",
    additionalInfo: "",
  });

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/custom-songs/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: OrderResponse = await response.json();

      if (data.success && data.orderId) {
        setOrderId(data.orderId);
        setStep("confirmation");
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      alert("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Order Received!
            </h1>
            <p className="text-lg text-slate-600 mb-4">
              Thank you for your custom song order. Diamonds McFly will begin crafting your personalized song shortly.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-500">Order Reference</p>
              <p className="text-xl font-mono font-bold text-teal-600">{orderId}</p>
            </div>
            <p className="text-slate-600 mb-8">
              A confirmation email has been sent to <strong>{formData.email}</strong> with your order details and next steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services/custom-songs">
                <Button variant="outline">Back to Custom Songs</Button>
              </Link>
              <Link href="/">
                <Button>Return Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Music className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Order Your Custom Song
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Tell us about your special moment and we'll create a personalized song that captures your story perfectly.
          </p>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0400 000 000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="eventDate">Event Date (if applicable)</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange("eventDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Package Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Select Your Package</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="package">Package *</Label>
                <Select
                  value={formData.package}
                  onValueChange={(value) => handleInputChange("package", value)}
                  required
                >
                  <SelectTrigger id="package">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packageOptions.map((pkg) => (
                      <SelectItem key={pkg.value} value={pkg.value}>
                        {pkg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="occasion">Occasion Type *</Label>
                <Select
                  value={formData.occasion}
                  onValueChange={(value) => handleInputChange("occasion", value)}
                  required
                >
                  <SelectTrigger id="occasion">
                    <SelectValue placeholder="What's the occasion?" />
                  </SelectTrigger>
                  <SelectContent>
                    {occasionOptions.map((occasion) => (
                      <SelectItem key={occasion} value={occasion}>
                        {occasion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Song Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Song Details</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="mood">Desired Mood</Label>
                <Select
                  value={formData.mood}
                  onValueChange={(value) => handleInputChange("mood", value)}
                >
                  <SelectTrigger id="mood">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {moodOptions.map((mood) => (
                      <SelectItem key={mood} value={mood}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="genre">Preferred Genre</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => handleInputChange("genre", value)}
                >
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genreOptions.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="storyDetails">Your Story *</Label>
              <Textarea
                id="storyDetails"
                required
                placeholder="Tell us about the person or moment this song is for. Include names, special memories, inside jokes, or meaningful details you'd like incorporated into the lyrics..."
                rows={6}
                value={formData.storyDetails}
                onChange={(e) => handleInputChange("storyDetails", e.target.value)}
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any other details, specific phrases to include, or things to avoid..."
                rows={3}
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
              />
            </div>
          </div>

          {/* Terms & Submit */}
          <div className="border-t pt-6">
            <p className="text-sm text-slate-500 mb-6">
              By submitting this order, you agree to our{" "}
              <Link href="/services/custom-songs/terms" className="text-teal-600 hover:underline">
                Terms & Conditions
              </Link>{" "}
              and acknowledge that songs are created using Suno AI technology with human creative direction by Diamonds McFly.
            </p>
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Order...
                </>
              ) : (
                "Submit Order Request"
              )}
            </Button>
          </div>
        </form>

        {/* AI Transparency Notice */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            Our songs are created using Suno AI technology with human creative direction and curation by Diamonds McFly.
          </p>
        </div>
      </div>
    </div>
  );
}
