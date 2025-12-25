/**
 * Claude API Integration
 * 
 * Provides streaming chat responses using Claude 3.5 Sonnet API
 */

import Anthropic from '@anthropic-ai/sdk';
import { formatSystemPrompt } from './knowledge-base';
import type { AIMessage } from '@/types/ai-assistant';

// Initialize Claude client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Validate message before sending to Claude API
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
  // Max length check
  if (message.length > 5000) {
    return { valid: false, error: 'Message too long (max 5000 characters)' };
  }

  // Empty message check
  if (message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  return { valid: true };
}

/**
 * Stream chat response from Claude API
 * 
 * @param messages - Array of conversation messages
 * @param onChunk - Optional callback for each text chunk
 * @returns Full response text
 */
export async function streamChatResponse(
  messages: AIMessage[],
  onChunk?: (text: string) => void
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  // Validate all messages
  for (const message of messages) {
    const validation = validateMessage(message.content);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  }

  const systemPrompt = formatSystemPrompt();

  try {
    const stream = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
        const text = chunk.delta.text;
        fullResponse += text;
        onChunk?.(text);
      }
    }

    return fullResponse;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error:', {
        status: error.status,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      
      // Provide more specific error messages based on status code
      if (error.status === 402 || error.status === 403) {
        // 402 = Payment Required, 403 = Forbidden (often means no credits)
        throw new Error('AI service credits exhausted. Please add credits to your Anthropic account and try again.');
      } else if (error.status === 429) {
        throw new Error('AI service rate limit exceeded. Please try again in a moment.');
      } else if (error.status === 500 || error.status === 503) {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      } else {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      }
    } else {
      console.error('Unexpected error in Claude API:', error);
      throw new Error('An error occurred processing your request. Please try again.');
    }
  }
}

/**
 * Create a non-streaming chat response (for testing)
 */
export async function createChatResponse(
  messages: AIMessage[]
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const systemPrompt = formatSystemPrompt();

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // Extract text from response
    const textBlock = response.content.find(block => block.type === 'text');
    
    if (textBlock && textBlock.type === 'text') {
      return textBlock.text;
    }

    return 'No response generated';
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error:', {
        status: error.status,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      
      // Provide more specific error messages based on status code
      if (error.status === 402 || error.status === 403) {
        // 402 = Payment Required, 403 = Forbidden (often means no credits)
        throw new Error('AI service credits exhausted. Please add credits to your Anthropic account and try again.');
      } else if (error.status === 429) {
        throw new Error('AI service rate limit exceeded. Please try again in a moment.');
      } else if (error.status === 500 || error.status === 503) {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      } else {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      }
    } else {
      console.error('Unexpected error in Claude API:', error);
      throw new Error('An error occurred processing your request. Please try again.');
    }
  }
}

