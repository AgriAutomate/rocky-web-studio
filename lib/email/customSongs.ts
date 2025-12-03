import { format } from "date-fns";

/**
 * Order email details interface
 */
export interface OrderEmailDetails {
  orderId: string;
  customerName: string;
  email: string;
  phone?: string;
  occasion: string;
  packageType: string;
  eventDate?: string;
  storyDetails: string;
  mood?: string;
  genre?: string;
  additionalInfo?: string;
}

/**
 * Package pricing information
 */
export const packagePrices: Record<string, { name: string; price: number; turnaround: string }> = {
  express: { name: "Express Personal", price: 49, turnaround: "24-48 hours" },
  standard: { name: "Standard Occasion", price: 29, turnaround: "3-5 days" },
  wedding: { name: "Wedding Trio", price: 149, turnaround: "5-7 days" },
};

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(details: OrderEmailDetails): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn("Skipping order confirmation email - RESEND_API_KEY is not configured.");
    return;
  }

  const packageInfo = packagePrices[details.packageType] || { name: details.packageType, price: 0, turnaround: "TBD" };
  const formattedEventDate = details.eventDate ? format(new Date(details.eventDate), "EEEE, MMMM d, yyyy") : "Not specified";

  const subject = `Custom Song Order Confirmation - ${details.orderId}`;
  const textBody = `
Hi ${details.customerName},

Thank you for your custom song order with Rocky Web Studio!

Order Details:
- Order ID: ${details.orderId}
- Package: ${packageInfo.name} ($${packageInfo.price})
- Occasion: ${details.occasion}
- Expected Turnaround: ${packageInfo.turnaround}
- Event Date: ${formattedEventDate}

What happens next:
1. Diamonds McFly will review your story and requirements
2. We'll reach out if we need any clarification
3. Your custom song will be crafted with care
4. You'll receive your song via email within the turnaround time

Your Story Details:
${details.storyDetails}

${details.mood ? `Desired Mood: ${details.mood}` : ""}
${details.genre ? `Preferred Genre: ${details.genre}` : ""}
${details.additionalInfo ? `Additional Notes: ${details.additionalInfo}` : ""}

If you have any questions, please reply to this email or contact us at music@rockywebstudio.com.au

Thank you for choosing Rocky Web Studio!

Diamonds McFly & The Rocky Web Studio Team
hello@rockywebstudio.com.au
  `.trim();

  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0;">🎵 Custom Song Order Confirmed</h1>
  </div>
  
  <div style="padding: 30px; background: #ffffff;">
    <p style="font-size: 16px;">Hi <strong>${details.customerName}</strong>,</p>
    <p style="font-size: 16px;">Thank you for your custom song order with Rocky Web Studio! We're excited to create something special for you.</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #0d9488; margin-top: 0;">Order Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #64748b;">Order ID:</td><td style="padding: 8px 0; font-weight: bold;">${details.orderId}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Package:</td><td style="padding: 8px 0;">${packageInfo.name} ($${packageInfo.price})</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Occasion:</td><td style="padding: 8px 0;">${details.occasion}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Turnaround:</td><td style="padding: 8px 0;">${packageInfo.turnaround}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Event Date:</td><td style="padding: 8px 0;">${formattedEventDate}</td></tr>
      </table>
    </div>
    
    <h3 style="color: #334155;">What happens next?</h3>
    <ol style="color: #475569; line-height: 1.8;">
      <li>Diamonds McFly will review your story and requirements</li>
      <li>We'll reach out if we need any clarification</li>
      <li>Your custom song will be crafted with care</li>
      <li>You'll receive your song via email within the turnaround time</li>
    </ol>
    
    <div style="background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #0d9488;"><strong>Your Story:</strong></p>
      <p style="margin: 10px 0 0 0; color: #475569;">${details.storyDetails}</p>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">Questions? Reply to this email or contact us at <a href="mailto:music@rockywebstudio.com.au" style="color: #0d9488;">music@rockywebstudio.com.au</a></p>
  </div>
  
  <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
    <p style="color: #94a3b8; margin: 0;">Diamonds McFly & The Rocky Web Studio Team</p>
    <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">Custom AI Songs for Central Queensland</p>
  </div>
</div>
  `.trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rocky Web Studio <music@rockywebstudio.com.au>",
        to: [details.email],
        subject: subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send order confirmation email:", errorData);
    }
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}

/**
 * Send internal notification email to admin
 */
export async function sendInternalNotificationEmail(details: OrderEmailDetails): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn("Skipping internal notification - RESEND_API_KEY is not configured.");
    return;
  }

  const packageInfo = packagePrices[details.packageType] || { name: details.packageType, price: 0, turnaround: "TBD" };
  const formattedEventDate = details.eventDate ? format(new Date(details.eventDate), "EEEE, MMMM d, yyyy") : "Not specified";

  const subject = `🎵 New Custom Song Order: ${details.orderId}`;
  const textBody = `
New Custom Song Order Received!

Order ID: ${details.orderId}
Customer: ${details.customerName}
Email: ${details.email}
Phone: ${details.phone || "Not provided"}

Package: ${packageInfo.name} ($${packageInfo.price})
Occasion: ${details.occasion}
Event Date: ${formattedEventDate}
Mood: ${details.mood || "Not specified"}
Genre: ${details.genre || "Not specified"}

Story Details:
${details.storyDetails}

Additional Info:
${details.additionalInfo || "None"}
  `.trim();

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rocky Web Studio <notifications@rockywebstudio.com.au>",
        to: ["hello@rockywebstudio.com.au"],
        subject: subject,
        text: textBody,
      }),
    });
  } catch (error) {
    console.error("Error sending internal notification:", error);
  }
}



