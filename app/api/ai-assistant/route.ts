/**
 * AI Assistant API Route
 * 
 * POST /api/ai-assistant
 * 
 * Provides AI-powered lead qualification chatbot using Claude 3.5 Sonnet API
 * 
 * Features:
 * - Streaming responses for real-time UX
 * - Rate limiting (10 requests/minute)
 * - Chat history storage in Supabase
 * - Error monitoring with Sentry
 */

import { NextRequest, NextResponse } from 'next/server';
import { streamChatResponse, validateMessage } from '@/lib/claude';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import type { AIMessage, AIAssistantRequest } from '@/types/ai-assistant';
import * as Sentry from '@sentry/nextjs';

// Force dynamic rendering for streaming
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/ai-assistant
 * 
 * Handles AI assistant chat requests with streaming responses
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check API key first
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[AI Assistant] ANTHROPIC_API_KEY not set');
      return NextResponse.json(
        {
          error: 'AI service configuration error',
          message: 'The AI assistant is not properly configured. Please contact support.',
        },
        { status: 500 }
      );
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // Parse request body
    let body: AIAssistantRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate last message (user message)
    const lastMessage = body.messages[body.messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    const validation = validateMessage(lastMessage.content);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Limit conversation history (keep last 10 messages for context)
    const messages: AIMessage[] = body.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Generate conversation ID if not provided
    const conversationId = body.conversationId || crypto.randomUUID();

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          console.log('[AI Assistant] Starting Claude API call', {
            messageCount: messages.length,
            conversationId,
            timestamp: new Date().toISOString(),
          });

          // Stream response from Claude
          await streamChatResponse(messages, (chunk) => {
            fullResponse += chunk;
            // Send chunk to client
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          });

          console.log('[AI Assistant] Claude API call completed', {
            responseLength: fullResponse.length,
            duration: Date.now() - startTime,
          });

    // Store conversation in Supabase (async, don't wait)
    if (fullResponse) {
      storeConversation(conversationId, messages, fullResponse, clientIP).catch((error) => {
        console.error('Failed to store conversation:', error);
        // Don't fail the request if storage fails
      });
    }

          // Send completion message
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ done: true, conversationId, message: fullResponse })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          // Log error to Sentry
          Sentry.captureException(error, {
            tags: {
              route: '/api/ai-assistant',
              clientIP,
            },
            extra: {
              conversationId,
              messageCount: messages.length,
            },
          });

          // Send error to client
          const errorMessage =
            error instanceof Error ? error.message : 'An error occurred processing your request';
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ error: errorMessage })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      },
    });
  } catch (error) {
    // Log unexpected errors
    Sentry.captureException(error, {
      tags: {
        route: '/api/ai-assistant',
      },
    });

    console.error('Unexpected error in AI Assistant API:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * Store conversation in Supabase
 * 
 * Creates or updates conversation and stores messages
 */
async function storeConversation(
  conversationId: string,
  messages: AIMessage[],
  assistantResponse: string,
  clientIP: string
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient(true);

    // Get last user message
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    if (!lastUserMessage) {
      return;
    }

    // Store conversation (upsert)
    const { error: convError } = await supabase
      .from('ai_assistant_conversations')
      .upsert(
        {
          id: conversationId,
          last_message: lastUserMessage.content,
          message_count: messages.length,
          client_ip: clientIP,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      );

    if (convError) {
      console.error('Failed to store conversation:', convError);
      // Don't throw - this is non-critical
      return;
    }

    // Store messages
    const messagesToStore = [
      ...messages.map(msg => ({
        conversation_id: conversationId,
        role: msg.role,
        content: msg.content,
        created_at: new Date().toISOString(),
      })),
      {
        conversation_id: conversationId,
        role: 'assistant' as const,
        content: assistantResponse,
        created_at: new Date().toISOString(),
      },
    ];

    const { error: messagesError } = await supabase
      .from('ai_assistant_messages')
      .insert(messagesToStore);

    if (messagesError) {
      console.error('Failed to store messages:', messagesError);
      // Don't throw - this is non-critical
    }
  } catch (error) {
    console.error('Error storing conversation:', error);
    // Don't throw - storage failure shouldn't break the API
  }
}

