"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ServiceOption {
  label: string;
  value: string;
}

interface ServiceLeadFormProps {
  serviceType?: string;
  serviceOptions?: ServiceOption[];
}

const DEFAULT_SERVICE_OPTIONS: ServiceOption[] = [
  { label: 'Emergency Service', value: 'emergency' },
  { label: 'Standard Service', value: 'standard' },
  { label: 'Premium Service', value: 'premium' },
  { label: 'Consultation', value: 'consultation' },
];

const URGENCY_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Next 48 Hours', value: 'next_48h' },
  { label: 'Next Week', value: 'next_week' },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  urgency: string;
  location: string;
  description: string;
}

export function ServiceLeadForm({ 
  serviceType: initialServiceType = '',
  serviceOptions = DEFAULT_SERVICE_OPTIONS 
}: ServiceLeadFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceType: initialServiceType,
    urgency: '',
    location: '',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear message when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields (First Name, Last Name, Email, Phone).',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/service/lead-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          serviceType: formData.serviceType || null,
          urgency: formData.urgency || null,
          location: formData.location.trim() || null,
          description: formData.description.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit service lead');
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Thank you! We will be in touch shortly.',
        });
        // Clear form on success
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          serviceType: initialServiceType,
          urgency: '',
          location: '',
          description: '',
        });
      } else {
        throw new Error(result.error || 'Failed to submit service lead');
      }
    } catch (error) {
      console.error('[ServiceLeadForm] Submission error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-4"
    >
      {/* Two-column grid for firstName and lastName */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="form-control"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="form-control"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Full width email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@example.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="form-control"
          required
          disabled={isLoading}
        />
      </div>

      {/* Full width phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+61 400 000 000"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="form-control"
          required
          disabled={isLoading}
        />
      </div>

      {/* Service Type dropdown */}
      <div className="space-y-2">
        <Label htmlFor="serviceType">Service Type</Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value) => handleChange('serviceType', value)}
          disabled={isLoading}
        >
          <SelectTrigger className="form-control">
            <SelectValue placeholder="Select a service type" />
          </SelectTrigger>
          <SelectContent>
            {serviceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Urgency dropdown */}
      <div className="space-y-2">
        <Label htmlFor="urgency">Urgency</Label>
        <Select
          value={formData.urgency}
          onValueChange={(value) => handleChange('urgency', value)}
          disabled={isLoading}
        >
          <SelectTrigger className="form-control">
            <SelectValue placeholder="Select urgency level" />
          </SelectTrigger>
          <SelectContent>
            {URGENCY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Full width location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          type="text"
          placeholder="City, State, Country"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          className="form-control"
          disabled={isLoading}
        />
      </div>

      {/* Description textarea */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Tell us about your service needs..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="form-control"
          rows={4}
          disabled={isLoading}
        />
      </div>

      {/* Message display area */}
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
          role="alert"
        >
          <span className="font-medium">
            {message.type === 'success' ? '✅ ' : '❌ '}
            {message.text}
          </span>
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading}
        aria-live="polite"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Service Request'
        )}
      </Button>
    </form>
  );
}
