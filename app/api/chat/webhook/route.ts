import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import { z } from "zod";

const logger = getLogger("api.chat.webhook");

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Chat webhook payload schema
 * Supports multiple chat widget formats (Drift, Intercom, Crisp)
 */
const chatWebhookSchema = z.object({
  conversation_id: z.string().optional(),
  visitor_id: z.string().optional(),
  message: z.string().min(1),
  visitor_email: z.string().email().optional(),
  visitor_name: z.string().optional(),
  visitor_phone: z.string().optional(),
  chat_widget_id: z.string().optional(),
  channel: z.enum(["chat", "email", "phone", "sms"]).default("chat"),
  language: z.string().default("en"),
  business_id: z.number().optional(),
});

/**
 * POST /api/chat/webhook
 * 
 * Receives webhook from chat widget (Drift/Intercom/Crisp)
 * Validates payload, stores conversation/message in database,
 * and triggers n8n workflow for AI processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate payload
    const validationResult = chatWebhookSchema.safeParse(body);
    if (!validationResult.success) {
      logger.error("Invalid chat webhook payload", {
        errors: validationResult.error.issues,
        received: Object.keys(body),
      });
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const payload = validationResult.data;
    const businessId = payload.business_id || parseInt(process.env.BUSINESS_ID || "1", 10);

    logger.info("Chat webhook received", {
      conversation_id: payload.conversation_id,
      visitor_id: payload.visitor_id,
      message_length: payload.message.length,
      channel: payload.channel,
    });

    const supabase = createServerSupabaseClient(true);

    // Find or create conversation
    let conversationId: number | null = null;

    if (payload.conversation_id || payload.visitor_id) {
      // Try to find existing conversation
      const { data: existingConversation } = await (supabase as any)
        .from("chat_conversations")
        .select("id")
        .eq("chat_widget_id", payload.conversation_id || "")
        .eq("visitor_id", payload.visitor_id || "")
        .eq("business_id", businessId)
        .single();

      if (existingConversation && existingConversation.id) {
        conversationId = existingConversation.id;
        logger.info("Found existing conversation", { conversationId });
      }
    }

    // Create conversation if not found
    if (!conversationId) {
      const { data: newConversation, error: convError } = await (supabase as any)
        .from("chat_conversations")
        .insert({
          chat_widget_id: payload.conversation_id,
          visitor_id: payload.visitor_id,
          visitor_email: payload.visitor_email,
          visitor_name: payload.visitor_name,
          visitor_phone: payload.visitor_phone,
          status: "active",
          channel: payload.channel,
          language: payload.language,
          business_id: businessId,
        })
        .select("id")
        .single();

      if (convError) {
        logger.error("Failed to create conversation", undefined, convError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create conversation",
          },
          { status: 500 }
        );
      }

      conversationId = newConversation?.id || null;
      if (conversationId) {
        logger.info("Created new conversation", { conversationId });
      }
    }

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create or find conversation",
        },
        { status: 500 }
      );
    }

    // Store message
    const { data: message, error: messageError } = await (supabase as any)
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        message_text: payload.message,
        sender_type: "user",
        sender_id: payload.visitor_id || "unknown",
      })
      .select("id")
      .single();

    if (messageError || !message) {
      logger.error("Failed to store message", undefined, messageError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to store message",
        },
        { status: 500 }
      );
    }

    const messageId = (message as any)?.id;
    if (!messageId) {
      logger.error("Message stored but ID not returned");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to get message ID",
        },
        { status: 500 }
      );
    }

    logger.info("Message stored", {
      message_id: messageId,
      conversation_id: conversationId,
    });

    // Trigger n8n workflow asynchronously (non-blocking)
    const n8nWebhookUrl = process.env.N8N_AI_CHAT_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message_id: messageId,
          visitor_id: payload.visitor_id,
          message: payload.message,
          visitor_email: payload.visitor_email,
          visitor_name: payload.visitor_name,
          business_id: businessId,
        }),
      }).catch((error) => {
        logger.error("Failed to trigger n8n webhook", undefined, error);
        // Don't block response on webhook failure
      });
    } else {
      logger.warn("N8N_AI_CHAT_WEBHOOK_URL not set - skipping n8n trigger");
    }

    // Return success immediately
    return NextResponse.json({
      success: true,
      conversation_id: conversationId,
      message_id: messageId,
      message: "Message received and queued for processing",
    });
  } catch (error) {
    logger.error("Error processing chat webhook", undefined, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
