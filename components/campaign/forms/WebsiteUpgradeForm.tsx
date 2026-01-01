"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FORM_FIELDS } from "@/lib/campaign-constants";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number").max(15),
  businessType: z.string().min(1, "Please select your business type"),
  currentPlatform: z.string().min(1, "Please select your current platform"),
  bestTime: z.string().optional(),
  message: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface WebsiteUpgradeFormProps {
  onSuccess?: () => void;
}

const WebsiteUpgradeForm = ({ onSuccess }: WebsiteUpgradeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/campaign/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Form submission failed');
      }

      toast({
        title: "Thanks for reaching out!",
        description: result.message || "We'll call you within 24 hours to discuss your website upgrade.",
      });
      
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessTypes = FORM_FIELDS.find(f => f.name === "businessType")?.options || [];
  const platforms = FORM_FIELDS.find(f => f.name === "currentPlatform")?.options || [];
  const times = FORM_FIELDS.find(f => f.name === "bestTime")?.options || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          placeholder="John Smith"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com.au"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0400 000 000"
          {...register("phone")}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Business Type */}
      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type *</Label>
        <Select onValueChange={(value) => setValue("businessType", value)}>
          <SelectTrigger className={errors.businessType ? "border-destructive" : ""}>
            <SelectValue placeholder="Select your business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.businessType && (
          <p className="text-sm text-destructive">{errors.businessType.message}</p>
        )}
      </div>

      {/* Current Platform */}
      <div className="space-y-2">
        <Label htmlFor="currentPlatform">Current Website Platform *</Label>
        <Select onValueChange={(value) => setValue("currentPlatform", value)}>
          <SelectTrigger className={errors.currentPlatform ? "border-destructive" : ""}>
            <SelectValue placeholder="Select your current platform" />
          </SelectTrigger>
          <SelectContent>
            {platforms.map((platform) => (
              <SelectItem key={platform} value={platform}>
                {platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.currentPlatform && (
          <p className="text-sm text-destructive">{errors.currentPlatform.message}</p>
        )}
      </div>

      {/* Best Time to Call */}
      <div className="space-y-2">
        <Label htmlFor="bestTime">Best Time to Call (Optional)</Label>
        <Select onValueChange={(value) => setValue("bestTime", value)}>
          <SelectTrigger>
            <SelectValue placeholder="When works best for you?" />
          </SelectTrigger>
          <SelectContent>
            {times.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Tell us briefly what you need help with (Optional)</Label>
        <Textarea
          id="message"
          placeholder="E.g., I need help getting more local customers to find my plumbing business..."
          rows={3}
          {...register("message")}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="cta"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Book Your Free Call"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By submitting, you agree to be contacted about your website upgrade.
        No spam, ever.
      </p>
    </form>
  );
};

export default WebsiteUpgradeForm;
