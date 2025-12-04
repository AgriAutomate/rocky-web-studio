import { NextRequest, NextResponse } from "next/server";
import { renderEmailTemplate } from "@/lib/email-templates/render";
import { CustomerOrderConfirmation } from "@/lib/email-templates/CustomerOrderConfirmation";
import { AdminOrderNotification } from "@/lib/email-templates/AdminOrderNotification";
import { BookingConfirmation } from "@/lib/email-templates/BookingConfirmation";

/**
 * Test endpoint to preview email templates
 * 
 * GET /api/test/email-preview?template=customer-order
 * GET /api/test/email-preview?template=admin-order
 * GET /api/test/email-preview?template=booking
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template") || "customer-order";

  try {
    let html: string;

    switch (template) {
      case "customer-order": {
        const component = (
          <CustomerOrderConfirmation
            orderId="ORD-1234567890"
            customerName="John Doe"
            packageName="Express Personal"
            packagePrice={49}
            occasion="Birthday"
            turnaround="24-48 hours"
            eventDate="2025-12-25"
            originalPrice={4900}
            finalPrice={4900}
            discountApplied={false}
            paymentIntentId="pi_1234567890abcdef"
          />
        );
        html = await renderEmailTemplate(component);
        break;
      }

      case "admin-order": {
        const component = (
          <AdminOrderNotification
            orderId="ORD-1234567890"
            customerName="John Doe"
            customerEmail="john@example.com"
            customerPhone="+61400000000"
            packageName="Express Personal"
            packagePrice={49}
            occasion="Birthday"
            turnaround="24-48 hours"
            eventDate="2025-12-25"
            storyDetails="This is a test story about a birthday celebration. The customer wants a fun and upbeat song."
            mood="Happy"
            genre="Pop"
            additionalInfo="Please include the person's name in the song."
            originalPrice={4900}
            finalPrice={4900}
            discountApplied={false}
            paymentIntentId="pi_1234567890abcdef"
            amountPaid={4900}
          />
        );
        html = await renderEmailTemplate(component);
        break;
      }

      case "booking": {
        const component = (
          <BookingConfirmation
            bookingId="BK1234567890"
            customerName="Jane Smith"
            email="jane@example.com"
            serviceType="Website Consultation (1 hour)"
            appointmentDate={new Date("2025-12-15T14:00:00")}
            appointmentTime="14:00"
          />
        );
        html = await renderEmailTemplate(component);
        break;
      }

      default:
        return NextResponse.json(
          {
            error: "Invalid template. Use: customer-order, admin-order, or booking",
          },
          { status: 400 }
        );
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

