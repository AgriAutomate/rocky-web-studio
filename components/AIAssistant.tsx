/**
 * AI Assistant Chatbot Component
 * 
 * WCAG 2.1 AA accessible chatbot UI with streaming responses
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import type { AIMessage } from '@/types/ai-assistant';

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Send message to AI Assistant API
   */
  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || isLoading) return;

    // Validate message length
    if (messageText.length > 5000) {
      setError('Message is too long. Please keep it under 5000 characters.');
      return;
    }

    // Add user message to UI immediately
    const userMessage: AIMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Create conversation ID if first message
    const convId = conversationId || crypto.randomUUID();
    if (!conversationId) {
      setConversationId(convId);
    }

    try {
      // Prepare messages for API (include conversation history)
      // Filter out any empty messages and ensure we have valid messages
      const validMessages = messages.filter(
        (m): m is AIMessage => 
          m.content && 
          m.role && 
          m.content.trim().length > 0 &&
          (m.role === 'user' || m.role === 'assistant')
      );
      
      const messagesForAPI: AIMessage[] = [
        ...validMessages,
        userMessage,
      ];

      // Create assistant message placeholder
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Call API with streaming
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesForAPI,
          conversationId: convId,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          throw new Error(
            data.message || 'Too many requests. Please wait a moment and try again.'
          );
        }
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.chunk) {
                fullResponse += data.chunk;
                // Update assistant message with streaming content
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content = fullResponse;
                  }
                  return newMessages;
                });
              }

              if (data.done) {
                // Conversation complete
                if (data.conversationId) {
                  setConversationId(data.conversationId);
                }
                break;
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred. Please try again.'
      );

      // Remove assistant message placeholder if error
      setMessages((prev) => prev.filter((msg, idx) => 
        !(idx === prev.length - 1 && msg.role === 'assistant' && msg.content === '')
      ));
    } finally {
      setIsLoading(false);
      // Refocus input after sending
      inputRef.current?.focus();
    }
  };

  /**
   * Handle Enter key (submit) or Shift+Enter (new line)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col h-full max-h-[600px] bg-card border border-border rounded-lg shadow-lg ${className || ''}`}
      role="region"
      aria-label="AI Assistant Chat"
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/50">
        <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
        <span className="ml-auto text-sm text-muted-foreground" aria-live="polite">
          {isLoading ? 'Thinking...' : 'Ready'}
        </span>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
            <p className="text-sm">
              Ask me about Rocky Web Studio's services, pricing, or processes.
            </p>
            <p className="text-xs mt-2">
              I can help you understand our web development, AI automation, and accessibility services.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.timestamp && (
                <p
                  className={`text-xs mt-1 ${
                    message.role === 'user'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          role="alert"
        >
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            className="flex-1 min-h-[60px] max-h-[120px] px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            disabled={isLoading}
            aria-label="Message input"
            aria-describedby="input-help"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="self-end"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <p id="input-help" className="text-xs text-muted-foreground mt-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

