/**
 * Voice assistant Claude streaming route
 * Reuses lib/claude.ts and the same knowledge base as the text widget
 */

import { NextRequest, NextResponse } from "next/server";
import { streamChatResponse, validateMessage } from "@/lib/claude";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { getPublishedCaseStudies } from "@/lib/supabase/case-studies";
import type { AIMessage } from "@/types/ai-assistant";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI service configuration error" },
        { status: 500 }
      );
    }

    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages, conversationId } = body as {
      transcript?: string;
      messages?: AIMessage[];
      conversationId?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    const claudeMessages: AIMessage[] = messages.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const lastMessage = claudeMessages[claudeMessages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    const validation = validateMessage(lastMessage.content);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const convId = conversationId || crypto.randomUUID();

    let caseStudies: Awaited<ReturnType<typeof getPublishedCaseStudies>> = [];
    try {
      caseStudies = await getPublishedCaseStudies();
    } catch (error) {
      console.error("[voice/respond] Case studies load failed:", error);
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChatResponse(
            claudeMessages,
            (chunk) => {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ chunk })}\n\n`)
              );
            },
            caseStudies
          );

          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`)
          );
          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "An error occurred processing your request";
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Limit": rateLimitResult.limit.toString(),
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.reset.toString(),
      },
    });
  } catch (error) {
    console.error("[voice/respond] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
