/**
 * TypeScript types for AI Assistant
 */

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAssistantRequest {
  messages: AIMessage[];
  conversationId?: string;
}

export interface AIAssistantResponse {
  message: string;
  conversationId: string;
  error?: string;
}

export interface KnowledgeBaseService {
  name: string;
  description: string;
  pricing: string;
  timeline: string;
  technologies?: string[];
}

export interface KnowledgeBaseFAQ {
  question: string;
  answer: string;
  category?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

