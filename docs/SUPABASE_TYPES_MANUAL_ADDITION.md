# Manual Supabase Types Addition - Exact Instructions
**Date:** December 25, 2025  
**File:** `types/supabase.ts`  
**Tables to Add:** `ai_assistant_conversations`, `ai_assistant_messages`

---

## Step-by-Step Instructions

### Step 1: Open `types/supabase.ts`

The file currently ends with:
```typescript
      song_order_audit: {
        // ... types ...
      }
    }  // <-- This closes the Tables object
    Views: {
      [_ in never]: never
    }
    // ... rest of file ...
  }
}
```

### Step 2: Find the Insertion Point

**Find this line:**
```typescript
      song_order_audit: {
        // ... existing types ...
      }
    }  // <-- Add new tables BEFORE this closing brace
```

### Step 3: Add the New Tables

**Add these two table definitions BEFORE the closing `}` of the `Tables` object:**

```typescript
      song_order_audit: {
        Row: {
          id: number
          order_id: string | null
          action: string
          timestamp: string
          details: Json | null
          user_email: string | null
          ip_address: string | null
        }
        Insert: {
          id?: number
          order_id?: string | null
          action: string
          timestamp?: string
          details?: Json | null
          user_email?: string | null
          ip_address?: string | null
        }
        Update: {
          id?: number
          order_id?: string | null
          action?: string
          timestamp?: string
          details?: Json | null
          user_email?: string | null
          ip_address?: string | null
        }
      }
      
      // ⬇️ ADD THESE TWO TABLES HERE ⬇️
      
      ai_assistant_conversations: {
        Row: {
          id: string
          last_message: string | null
          message_count: number
          client_ip: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          last_message?: string | null
          message_count?: number
          client_ip?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          last_message?: string | null
          message_count?: number
          client_ip?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_assistant_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
      }
    }  // <-- Tables object closes here
```

### Step 4: Add Type Helpers (Optional but Recommended)

At the bottom of the file, after the existing type helpers, add:

```typescript
// Existing helpers:
export type SongOrder = Database['public']['Tables']['song_orders']['Row'];
export type SongOrderInsert = Database['public']['Tables']['song_orders']['Insert'];
export type SongOrderUpdate = Database['public']['Tables']['song_orders']['Update'];

export type SongOrderAudit = Database['public']['Tables']['song_order_audit']['Row'];

// ⬇️ ADD THESE NEW HELPERS ⬇️

export type AIAssistantConversation = Database['public']['Tables']['ai_assistant_conversations']['Row'];
export type AIAssistantConversationInsert = Database['public']['Tables']['ai_assistant_conversations']['Insert'];
export type AIAssistantConversationUpdate = Database['public']['Tables']['ai_assistant_conversations']['Update'];

export type AIAssistantMessage = Database['public']['Tables']['ai_assistant_messages']['Row'];
export type AIAssistantMessageInsert = Database['public']['Tables']['ai_assistant_messages']['Insert'];
export type AIAssistantMessageUpdate = Database['public']['Tables']['ai_assistant_messages']['Update'];
```

---

## Complete Example: What the File Should Look Like

After adding, your `types/supabase.ts` should have this structure:

```typescript
export interface Database {
  public: {
    Tables: {
      song_orders: {
        // ... existing types ...
      }
      song_order_audit: {
        // ... existing types ...
      }
      
      // NEW TABLES ADDED HERE:
      ai_assistant_conversations: {
        Row: {
          id: string
          last_message: string | null
          message_count: number
          client_ip: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          last_message?: string | null
          message_count?: number
          client_ip?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          last_message?: string | null
          message_count?: number
          client_ip?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_assistant_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type SongOrder = Database['public']['Tables']['song_orders']['Row'];
export type SongOrderInsert = Database['public']['Tables']['song_orders']['Insert'];
export type SongOrderUpdate = Database['public']['Tables']['song_orders']['Update'];

export type SongOrderAudit = Database['public']['Tables']['song_order_audit']['Row'];

// NEW TYPE HELPERS:
export type AIAssistantConversation = Database['public']['Tables']['ai_assistant_conversations']['Row'];
export type AIAssistantConversationInsert = Database['public']['Tables']['ai_assistant_conversations']['Insert'];
export type AIAssistantConversationUpdate = Database['public']['Tables']['ai_assistant_conversations']['Update'];

export type AIAssistantMessage = Database['public']['Tables']['ai_assistant_messages']['Row'];
export type AIAssistantMessageInsert = Database['public']['Tables']['ai_assistant_messages']['Insert'];
export type AIAssistantMessageUpdate = Database['public']['Tables']['ai_assistant_messages']['Update'];
```

---

## Verification

After adding the types:

1. **Save the file**

2. **Run TypeScript check:**
   ```bash
   npm run type-check
   ```
   Should show no errors.

3. **Test in your API route:**
   ```typescript
   // app/api/ai-assistant/route.ts
   import { createServerSupabaseClient } from '@/lib/supabase/client';
   
   const supabase = createServerSupabaseClient(true);
   
   // This should now have autocomplete:
   const { data, error } = await supabase
     .from('ai_assistant_conversations')  // ← Should autocomplete!
     .insert({
       id: crypto.randomUUID(),
       last_message: 'Test',
       message_count: 1,
     });
   ```

4. **Restart TypeScript Server** (if autocomplete doesn't work):
   - VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

---

## Quick Copy-Paste Block

Here's the exact code to copy and paste (just the new tables):

```typescript
      ai_assistant_conversations: {
        Row: {
          id: string
          last_message: string | null
          message_count: number
          client_ip: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          last_message?: string | null
          message_count?: number
          client_ip?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          last_message?: string | null
          message_count?: number
          client_ip?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_assistant_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
      }
```

**And the type helpers:**

```typescript
export type AIAssistantConversation = Database['public']['Tables']['ai_assistant_conversations']['Row'];
export type AIAssistantConversationInsert = Database['public']['Tables']['ai_assistant_conversations']['Insert'];
export type AIAssistantConversationUpdate = Database['public']['Tables']['ai_assistant_conversations']['Update'];

export type AIAssistantMessage = Database['public']['Tables']['ai_assistant_messages']['Row'];
export type AIAssistantMessageInsert = Database['public']['Tables']['ai_assistant_messages']['Insert'];
export type AIAssistantMessageUpdate = Database['public']['Tables']['ai_assistant_messages']['Update'];
```

---

**Time Required:** 5 minutes  
**Difficulty:** Easy  
**Result:** Type-safe database queries for AI Assistant tables

