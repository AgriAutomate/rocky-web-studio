import { differenceInHours } from "date-fns";
import { getLogger } from "@/lib/logging";
import type { Booking } from "./storage";

const cancellationLogger = getLogger("bookings.cancellation");

/**
 * Check if booking can be cancelled (> 24 hours before appointment)
 */
export function canCancelBooking(booking: Booking): {
  canCancel: boolean;
  hoursUntilAppointment: number;
  reason?: string;
} {
  try {
    const [year, month, day] = booking.date.split("-").map(Number);
    const [hour, minute] = booking.time.split(":").map(Number);

    if (!year || !month || !day || hour === undefined || minute === undefined) {
      return {
        canCancel: false,
        hoursUntilAppointment: 0,
        reason: "Invalid booking date/time format",
      };
    }

    const appointmentDate = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    const hoursUntilAppointment = differenceInHours(appointmentDate, now);

    if (hoursUntilAppointment < 24) {
      return {
        canCancel: false,
        hoursUntilAppointment,
        reason: "Cannot cancel booking less than 24 hours before appointment",
      };
    }

    if (booking.status === "cancelled") {
      return {
        canCancel: false,
        hoursUntilAppointment,
        reason: "Booking is already cancelled",
      };
    }

    return {
      canCancel: true,
      hoursUntilAppointment,
    };
  } catch (error) {
    cancellationLogger.error("Error checking cancellation eligibility", { bookingId: booking.bookingId }, error);
    return {
      canCancel: false,
      hoursUntilAppointment: 0,
      reason: "Error checking cancellation eligibility",
    };
  }
}

/**
 * Process Stripe refund if payment exists
 */
export async function processRefund(
  paymentIntentId: string | undefined
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  if (!paymentIntentId) {
    return { success: true }; // No payment to refund
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    cancellationLogger.warn("Stripe secret key not configured, skipping refund", {
      paymentIntentId,
    });
    return { success: false, error: "Stripe not configured" };
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    });

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
    });

    cancellationLogger.info("Refund processed successfully", {
      paymentIntentId,
      refundId: refund.id,
      amount: refund.amount,
    });

    return {
      success: true,
      refundId: refund.id,
    };
  } catch (error) {
    cancellationLogger.error("Refund processing failed", { paymentIntentId }, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Refund failed",
    };
  }
}

