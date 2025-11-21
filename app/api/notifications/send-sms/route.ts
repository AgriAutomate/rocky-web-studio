import { NextRequest, NextResponse } from "next/server";
import { parse, isValid, format } from "date-fns";
import { sendSMS } from "@/lib/sms";

interface SMSNotificationRequest {
  phone: string;
  name: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  serviceType: string;
  customRef?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SMSNotificationRequest = await request.json();

    const requiredFields = ["phone", "name", "date", "time", "serviceType"];
    const missing = requiredFields.filter((field) => !body[field as keyof SMSNotificationRequest]);
    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const parsedDate = parse(body.date, "yyyy-MM-dd", new Date());
    const displayDate = isValid(parsedDate)
      ? format(parsedDate, "EEEE, MMMM d")
      : body.date;

    const message = `Hi ${body.name}! Your booking with Rocky Web Studio is confirmed for ${displayDate} at ${body.time}. Service: ${body.serviceType}. Questions? Reply to this SMS or call us. Thanks!`;

    const result = await sendSMS(body.phone, message, body.customRef);

    if (!result.success) {
      console.warn("Mobile Message SMS failed", {
        phone: body.phone,
        serviceType: body.serviceType,
        error: result.error,
      });
      return NextResponse.json({
        success: false,
        error: result.error || "SMS dispatch failed",
      });
    }

    return NextResponse.json({
      success: true,
      response: result.response,
    });
  } catch (error: any) {
    console.error("SMS notification error:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Unexpected error sending SMS",
    });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

interface NotificationRequest {
  phone: string;
  name: string;
  date: string;
  time: string;
  serviceType: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationRequest = await request.json();

    if (!body.phone || !body.name || !body.date || !body.time || !body.serviceType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields for SMS notification.",
        },
        { status: 400 }
      );
    }

    const message = `Hi ${body.name}! Your booking with Rocky Web Studio is confirmed for ${body.date} at ${body.time}. Service: ${body.serviceType}. Questions? Reply to this SMS or call us. Thanks!`;
    const result = await sendSMS(body.phone, message, body.serviceType);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "SMS provider error." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, response: result.response }, { status: 200 });
  } catch (error: any) {
    console.error("SMS notification route error", { error: error?.message });
    return NextResponse.json(
      { success: false, error: error?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

