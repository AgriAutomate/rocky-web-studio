/**
 * AI Assistant Test Page
 * 
 * Temporary test page for testing the AI Assistant component
 * Navigate to /test-ai to test
 */

import { AIAssistant } from '@/components/AIAssistant';

export default function TestAIPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Assistant Test Page</h1>
        <p className="text-muted-foreground">
          Test the AI Assistant chatbot component. Messages are stored in Supabase.
        </p>
      </div>
      
      <div className="h-[600px]">
        <AIAssistant />
      </div>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="font-semibold mb-2">Test Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Type a message and press Enter to send</li>
          <li>Watch the streaming response appear in real-time</li>
          <li>Check Supabase dashboard to verify messages are stored</li>
          <li>Test keyboard navigation (Tab, Enter, Shift+Enter)</li>
        </ul>
      </div>
    </div>
  );
}

