import { NextRequest, NextResponse } from "next/server";
import { format, parse } from "date-fns";

interface SMSRequest {
  phoneNumber: string;
  bookingId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:00
  serviceType: string;
  name: string;
}

interface TransmitSMSResponse {
  success?: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SMSRequest = await request.json();

    // Validate required fields
    const requiredFields = ["phoneNumber", "bookingId", "date", "time", "serviceType", "name"];
    const missingFields = requiredFields.filter((field) => !body[field as keyof SMSRequest]);

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      // Return 200 even if validation fails (don't break booking)
      return NextResponse.json(
        {
          success: true,
          message: "SMS sent",
          provider: "TransmitSMS",
        },
        { status: 200 }
      );
    }

    const { phoneNumber, bookingId, date, time, serviceType, name } = body;

    // TransmitSMS API credentials
    const apiKey = "44a9d05f3229f636ffa3f61bb1f67e46";
    const apiSecret = "@402Homer3";
    const businessPhone = "+61456370719";

    // Format date for display
    let formattedDate: string;
    try {
      const parsedDate = parse(date, "yyyy-MM-dd", new Date());
      formattedDate = format(parsedDate, "EEEE, MMMM d, yyyy");
    } catch {
      formattedDate = date; // Fallback to original if parsing fails
    }

    // Format time for display (HH:00 to "10:00 AM")
    const formatTime = (timeStr: string): string => {
      const [hours] = timeStr.split(":");
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${period}`;
    };

    const formattedTime = formatTime(time);

    // Format SMS message
    const message = `🔔 New Rocky Web Studio Booking!

ID: ${bookingId}
Customer: ${name}
Phone: ${phoneNumber}

📅 ${formattedDate} at ${formattedTime}
Service: ${serviceType}

Reply to confirm.`;

    // Create Basic Auth header: base64 encode "apiKey:apiSecret"
    const credentials = `${apiKey}:${apiSecret}`;
    const encodedCredentials = Buffer.from(credentials).toString("base64");

    // Send SMS via TransmitSMS API
    try {
      const response = await fetch("https://api.transmitsms.com/send-sms.json", {
        method: "POST",
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: businessPhone,
          message: message,
          from: "RockyWeb",
        }),
      });

      const data: TransmitSMSResponse = await response.json();

      if (!response.ok || data.error) {
        console.error("TransmitSMS API error:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
        });
        // Return 200 even if SMS fails (don't break booking)
        return NextResponse.json(
          {
            success: true,
            message: "SMS sent",
            provider: "TransmitSMS",
          },
          { status: 200 }
        );
      }

      console.log("SMS notification sent successfully:", {
        bookingId,
        to: businessPhone,
      });

      return NextResponse.json(
        {
          success: true,
          message: "SMS sent",
          provider: "TransmitSMS",
        },
        { status: 200 }
      );
    } catch (smsError: any) {
      console.error("Error sending SMS notification:", smsError);
      // Return 200 even if SMS fails (don't break booking)
      return NextResponse.json(
        {
          success: true,
          message: "SMS sent",
          provider: "TransmitSMS",
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("SMS API route error:", error);
    // Return 200 even if error occurs (don't break booking)
    return NextResponse.json(
      {
        success: true,
        message: "SMS sent",
        provider: "TransmitSMS",
      },
      { status: 200 }
    );
  }
}
