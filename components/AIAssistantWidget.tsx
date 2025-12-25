/**
 * AI Assistant Floating Widget
 * 
 * Floating chatbot widget that replaces Crisp/Drift/Intercom
 * WCAG 2.1 AA accessible with keyboard navigation
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, MessageSquare, X, Minimize2 } from 'lucide-react';
import type { AIMessage } from '@/types/ai-assistant';

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  // Close widget when clicking outside (optional - can be removed if you want it to stay open)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node) &&
        isOpen &&
        !isMinimized
      ) {
        // Only close if clicking outside the widget
        // You can remove this if you want the widget to stay open
      }
    };

    if (isOpen && !isMinimized) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, isMinimized]);

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
      const validMessages = messages.filter(
        (m): m is AIMessage =>
          typeof m.content === 'string' &&
          m.content.trim().length > 0 &&
          typeof m.role === 'string' &&
          (m.role === 'user' || m.role === 'assistant')
      );

      const messagesForAPI: AIMessage[] = [...validMessages, userMessage];

      // Create assistant message placeholder
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Call API with streaming (with timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      let response: Response;
      try {
        response = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messagesForAPI,
            conversationId: convId,
          }),
          signal: controller.signal,
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw new Error('Failed to connect to server. Please check your connection.');
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                fullResponse += parsed.chunk;
                // Update assistant message with streaming content
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = fullResponse;
                  }
                  return newMessages;
                });
              }

              if (parsed.done) {
                setIsLoading(false);
                // Update conversation ID if provided
                if (parsed.conversationId) {
                  setConversationId(parsed.conversationId);
                }
              }

              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // If it's our error, rethrow it
              if (e instanceof Error && e.message) {
                throw e;
              }
              // Otherwise skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setIsLoading(false);
      let errorMessage = 'Failed to send message';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Log error for debugging
      console.error('AI Assistant error:', err);
      
      setError(errorMessage);
      // Remove the assistant message placeholder on error
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // Escape closes the widget
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Open AI Assistant chat"
          aria-expanded="false"
        >
          <MessageSquare className="h-6 w-6 mx-auto" aria-hidden="true" />
          <span className="sr-only">Open chat</span>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          ref={widgetRef}
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-background border border-border rounded-lg shadow-2xl transition-all duration-300 ${
            isMinimized
              ? 'h-16 w-80'
              : 'h-[600px] w-[400px] max-h-[calc(100vh-3rem)] max-w-[calc(100vw-3rem)] sm:h-[600px] sm:w-[400px]'
          }`}
          role="dialog"
          aria-label="AI Assistant Chat"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/50 rounded-t-lg">
            <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground flex-1">
              AI Assistant
            </h2>
            <span
              className="text-sm text-muted-foreground"
              aria-live="polite"
            >
              {isLoading ? 'Thinking...' : 'Ready'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
              className="h-8 w-8"
            >
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">
                {isMinimized ? 'Expand' : 'Minimize'}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                role="log"
                aria-live="polite"
                aria-atomic="false"
              >
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare
                      className="h-12 w-12 mx-auto mb-4 opacity-50"
                      aria-hidden="true"
                    />
                    <p className="text-sm">
                      Ask me about Rocky Web Studio's services, pricing, or
                      processes.
                    </p>
                    <p className="text-xs mt-2">
                      I can help you understand our web development, AI
                      automation, and accessibility services.
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
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
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
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
              <div className="p-4 border-t border-border bg-muted/30 rounded-b-lg">
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
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
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
            </>
          )}
        </div>
      )}
    </>
  );
}

