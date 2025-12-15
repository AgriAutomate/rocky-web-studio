"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";

export type SmsStatus = "idle" | "sending" | "success" | "error";

interface BookingConfirmationProps {
  smsOptIn: boolean;
  phone: string;
  customerName: string;
  date: string;
  time: string;
  service: string;
  smsStatus: SmsStatus;
  smsError?: string | Error;
  onClose?: () => void;
}

const maskPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 4) {
    const last = digits.slice(-3);
    const masked = digits.slice(0, -3).replace(/\d/g, "X");
    return `${masked.slice(0, 4)} ${masked.slice(4, 7)} ${last}`;
  }
  return phone;
};

export default function BookingConfirmation({
  smsOptIn,
  phone,
  customerName,
  date,
  time,
  service,
  smsStatus,
  smsError,
  onClose,
}: BookingConfirmationProps) {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    if (!smsOptIn) {
      setVisible(false);
      return;
    }

    setVisible(true);
  }, [smsOptIn, phone, customerName, date, time, service]);

  useEffect(() => {
    if (!smsOptIn) {
      return;
    }

    if (smsStatus === "success") {
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }

    setVisible(true);
  }, [smsStatus, smsOptIn]);

  const statusContent = useMemo(() => {
    switch (smsStatus) {
      case "sending":
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
          text: "📱 Sending confirmation SMS...",
          color: "text-primary",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
          text: `✅ Confirmation SMS sent to ${maskPhone(phone)}`,
          color: "text-primary",
        };
      case "error":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
          text:
            "⚠️ SMS couldn't be sent, but email confirmation was delivered",
          color: "text-destructive",
        };
      default:
        return null;
    }
  }, [smsStatus, phone]);

  if (!visible || !smsOptIn || !statusContent) {
    return null;
  }

  const formattedDate = new Date(`${date}T${time}`).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const smsErrorMessage =
    smsError instanceof Error ? smsError.message : smsError ?? "Unknown error";

  return (
    <div className="relative rounded-2xl border border-border bg-muted p-4 shadow-sm">
      <button
        className="absolute right-3 top-3 rounded-full border border-transparent p-1 text-muted-foreground transition hover:border-border hover:text-foreground"
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex items-center gap-3">
        {statusContent.icon}
        <p className={`text-sm font-medium ${statusContent.color}`}>
          {statusContent.text}
        </p>
      </div>
      {smsStatus === "error" && (
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>Hi {customerName}, your booking confirmed via email on {formattedDate}.</p>
          <p>Reply to the confirmation email if you need help.</p>
          {smsErrorMessage && (
            <p className="text-destructive">Details: {smsErrorMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}


