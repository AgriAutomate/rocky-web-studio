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
      model: 'claude-3-haiku-20240307', // Using Haiku as Claude 3.5 Sonnet requires upgraded plan
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
      console.error('[Claude API] Error:', {
        status: error.status,
        message: error.message,
        errorName: error.name,
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
      } else if (error.status === 401) {
        throw new Error('AI service authentication failed. Please check API key configuration.');
      } else {
        // Include status code in error for debugging
        throw new Error(`AI service error (${error.status}): ${error.message || 'Please try again later.'}`);
      }
    } else if (error instanceof Error) {
      // Network errors, timeouts, etc.
      console.error('[Claude API] Network/Connection error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        throw new Error('Unable to connect to AI service. Please check your internet connection.');
      } else {
        throw new Error(`Connection error: ${error.message}`);
      }
    } else {
      console.error('[Claude API] Unexpected error:', error);
      throw new Error('An unexpected error occurred. Please try again.');
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
      model: 'claude-3-haiku-20240307', // Using Haiku as Claude 3.5 Sonnet requires upgraded plan
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
      console.error('[Claude API] Error:', {
        status: error.status,
        message: error.message,
        errorName: error.name,
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
      } else if (error.status === 401) {
        throw new Error('AI service authentication failed. Please check API key configuration.');
      } else {
        // Include status code in error for debugging
        throw new Error(`AI service error (${error.status}): ${error.message || 'Please try again later.'}`);
      }
    } else if (error instanceof Error) {
      // Network errors, timeouts, etc.
      console.error('[Claude API] Network/Connection error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        throw new Error('Unable to connect to AI service. Please check your internet connection.');
      } else {
        throw new Error(`Connection error: ${error.message}`);
      }
    } else {
      console.error('[Claude API] Unexpected error:', error);
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
}

