"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SendHorizonal } from "lucide-react";
import { z } from "zod";

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

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Enter a valid email address."),
  company: z.string().min(2, "Tell us where you work."),
  budget: z.string().min(1, "Select your budget range."),
  message: z.string().min(10, "Share a bit more context."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const budgets = [
  "Under $10k",
  "$10k - $25k",
  "$25k - $50k",
  "$50k - $100k",
  "$100k+ (retainer)",
];

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      budget: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setStatus('idle');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          company: values.company,
          budget: values.budget,
          message: values.message,
          // Honeypot field (hidden from users, bots will fill it)
          website: '', // Empty = human, filled = bot
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      setStatus('success');
      reset();
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
    }
  };

  return (
    <section
      id="contact"
      className="grid gap-10 rounded-[32px] bg-card p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Contact
        </p>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Tell us about your next launch.
        </h2>
        <p className="text-base text-muted-foreground">
          Share a snapshot of your goals, timeline, and tech stack. We typically
          respond within 1-2 business days with a recommended engagement.
        </p>
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">What to expect</p>
          <ul className="mt-3 space-y-2">
            <li>- A quick chemistry call with our strategy lead</li>
            <li>- Tailored scope & investment options</li>
            <li>- Access to recent work and case studies</li>
          </ul>
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-3xl border border-border bg-muted p-6 shadow-sm md:p-8"
      >
        {/* Honeypot field - hidden from users, bots will fill it */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="Alex Rocky"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register('name')}
            />
            {errors.name ? (
              <p id="name-error" className="text-xs text-destructive" role="alert">
                {errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="martin@rockywebstudio.com.au"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register('email')}
            />
            {errors.email ? (
              <p id="email-error" className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="Northwind Labs"
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? "company-error" : undefined}
            {...register('company')}
          />
          {errors.company ? (
            <p id="company-error" className="text-xs text-destructive" role="alert">
              {errors.company.message}
            </p>
          ) : null}
        </div>
          <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Controller
            name="budget"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="budget"
                  aria-invalid={!!errors.budget}
                  aria-describedby={errors.budget ? "budget-error" : undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Select an investment range" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.budget ? (
            <p id="budget-error" className="text-xs text-destructive" role="alert">
              {errors.budget.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Project details</Label>
          <Textarea
            id="message"
            placeholder="Timeline, success metrics, integrations..."
            rows={6}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
            {...register('message')}
          />
          {errors.message ? (
            <p id="message-error" className="text-xs text-destructive" role="alert">
              {errors.message.message}
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          aria-live="polite"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              Send proposal
              <SendHorizonal className="ml-2 size-4" />
            </>
          )}
        </Button>
        {status === 'success' ? (
          <p className="text-sm text-primary">
            Thanks! We typically respond within 1-2 business days.
          </p>
        ) : null}
        {status === 'error' ? (
          <p className="text-sm text-destructive" role="alert">
            Something went wrong. Please try again or email martin@rockywebstudio.com.au.
          </p>
        ) : null}
      </form>
    </section>
  );
}
