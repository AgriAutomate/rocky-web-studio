import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createLead } from "@/lib/supabase/leads";
import type { LeadCreate } from "@/types/lead";

const formSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(8).max(15),
  businessType: z.string().min(1),
  currentPlatform: z.string().min(1),
  bestTime: z.string().optional(),
  message: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate form data
    const validatedData = formSchema.parse(body);

    // Combine bestTime and message into a single message field for the database
    let combinedMessage = validatedData.message || "";
    if (validatedData.bestTime) {
      const bestTimeText = `Best time to call: ${validatedData.bestTime}`;
      combinedMessage = combinedMessage 
        ? `${combinedMessage}\n\n${bestTimeText}` 
        : bestTimeText;
    }

    // Map form data to LeadCreate type
    const leadData: LeadCreate = {
      name: validatedData.name.trim(),
      email: validatedData.email.trim().toLowerCase(),
      phone: validatedData.phone.trim(),
      company: validatedData.businessType.trim(),
      project_type: validatedData.currentPlatform.trim(),
      message: combinedMessage.trim() || undefined,
      source: "website upgrade campaign",
      status: "new",
    };

    // Save to Supabase database
    try {
      await createLead(leadData);
      console.log("Campaign form submission saved to database:", {
        email: leadData.email,
        source: leadData.source,
      });
    } catch (dbError) {
      console.error("Failed to save campaign form submission to database:", dbError);
      // Continue to return success to user even if DB save fails
      // (you may want to handle this differently in production)
    }

    // TODO: Send confirmation email
    // TODO: Send internal notification
    // TODO: Track conversion events (Meta Pixel, GA4, Google Ads)

    return NextResponse.json(
      { 
        success: true, 
        message: "Form submitted successfully. We'll call you within 24 hours." 
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Form submission error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while submitting the form." },
      { status: 500 }
    );
  }
}
