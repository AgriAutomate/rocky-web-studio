# How to Update Supabase TypeScript Types
**Date:** December 25, 2025  
**Purpose:** Add types for new AI Assistant tables  
**Tables:** `ai_assistant_conversations`, `ai_assistant_messages`

---

## Overview

After running the Supabase migration, you need to update TypeScript types so your code has type safety when working with the new tables.

**Two Methods:**
1. **Automated (Recommended)** - Generate types from database
2. **Manual** - Add types manually to `types/supabase.ts`

---

## Method 1: Automated Type Generation (Recommended)

### Prerequisites

1. **Supabase CLI installed**
   ```bash
   npm install -g supabase
   # OR
   npx supabase --version
   ```

2. **Supabase project linked** (if using CLI)
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

### Option A: Using Supabase CLI (Local Project)

If you have Supabase CLI set up locally:

```bash
# Generate types from local database
supabase gen types typescript --local > types/supabase.ts
```

### Option B: Using Supabase CLI (Remote Project)

If you want to generate from your remote Supabase project:

```bash
# Generate types from remote database
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

**To get your Project ID:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → General
4. Copy "Reference ID" (this is your project ID)

**With API Key:**
```bash
supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  --schema public \
  > types/supabase.ts
```

### Option C: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Scroll to **"Generate TypeScript types"**
5. Click **"Generate types"**
6. Copy the generated types
7. Replace contents of `types/supabase.ts` with the generated types

**Note:** This generates types for ALL tables, not just new ones.

---

## Method 2: Manual Type Addition

If you prefer to add types manually or automated generation isn't working:

### Step 1: Open `types/supabase.ts`

The file structure looks like:
```typescript
export interface Database {
  public: {
    Tables: {
      song_orders: { ... },
      song_order_audit: { ... },
      // ... other tables ...
    }
  }
}
```

### Step 2: Add New Table Types

Add the following types **inside** the `Tables` object (after existing tables):

```typescript
export interface Database {
  public: {
    Tables: {
      // ... existing tables ...
      
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
  }
}
```

### Step 3: Verify Types

After adding, run TypeScript check:
```bash
npm run type-check
```

If there are no errors, types are correct!

---

## Complete Manual Type Addition Example

Here's exactly where and how to add the types in your `types/supabase.ts` file:

### Find This Section:
```typescript
export interface Database {
  public: {
    Tables: {
      song_orders: { ... },
      song_order_audit: { ... },
      // ... other existing tables ...
    }
  }
}
```

### Add After Existing Tables:

```typescript
export interface Database {
  public: {
    Tables: {
      song_orders: {
        // ... existing song_orders types ...
      }
      song_order_audit: {
        // ... existing song_order_audit types ...
      }
      
      // ADD THESE TWO NEW TABLES HERE:
      
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
  }
}
```

---

## Type Definitions Explained

### Row Type
- **Purpose:** Type for data when **reading** from database
- **Fields:** All columns, with nullable types matching database schema
- **Example:** `const conversation: Database['public']['Tables']['ai_assistant_conversations']['Row'] = { ... }`

### Insert Type
- **Purpose:** Type for data when **inserting** into database
- **Fields:** Required fields (no defaults), optional fields (with defaults or nullable)
- **Example:** `await supabase.from('ai_assistant_conversations').insert({ ... })`

### Update Type
- **Purpose:** Type for data when **updating** database records
- **Fields:** All fields optional (you only update what you want to change)
- **Example:** `await supabase.from('ai_assistant_conversations').update({ ... })`

---

## Verification Steps

### 1. TypeScript Check
```bash
npm run type-check
```

**Expected:** No errors related to `ai_assistant_conversations` or `ai_assistant_messages`

### 2. Test in Code

Try using the types in your API route:

```typescript
// app/api/ai-assistant/route.ts
import type { Database } from '@/types/supabase';

// This should now have autocomplete and type checking
const conversation: Database['public']['Tables']['ai_assistant_conversations']['Insert'] = {
  id: crypto.randomUUID(),
  last_message: 'Test message',
  message_count: 1,
  client_ip: '127.0.0.1',
};
```

### 3. Verify Supabase Client

The Supabase client should now recognize the new tables:

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/client';

const supabase = createServerSupabaseClient(true);

// This should have autocomplete for 'ai_assistant_conversations'
const { data, error } = await supabase
  .from('ai_assistant_conversations')
  .insert({ ... });
```

---

## Troubleshooting

### Error: "Property 'ai_assistant_conversations' does not exist"

**Cause:** Types not updated or migration not run

**Fix:**
1. Verify migration ran: Check Supabase dashboard for tables
2. Regenerate types or add manually
3. Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")

### Error: "Type 'string' is not assignable to type 'user' | 'assistant'"

**Cause:** Type mismatch in role field

**Fix:** Ensure role is typed as `'user' | 'assistant'` (literal union type, not string)

### Error: "Cannot find module '@/types/supabase'"

**Cause:** Import path issue

**Fix:** Verify `tsconfig.json` has correct path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Quick Reference: Table Schema

### `ai_assistant_conversations`
```sql
id UUID PRIMARY KEY
last_message TEXT (nullable)
message_count INTEGER (default 0)
client_ip TEXT (nullable)
created_at TIMESTAMPTZ (default NOW())
updated_at TIMESTAMPTZ (default NOW())
```

### `ai_assistant_messages`
```sql
id UUID PRIMARY KEY
conversation_id UUID (references ai_assistant_conversations.id)
role TEXT (CHECK: 'user' | 'assistant')
content TEXT (not null)
created_at TIMESTAMPTZ (default NOW())
```

---

## Recommended Approach

**For this project, I recommend:**

1. **First try:** Supabase Dashboard → Settings → API → Generate TypeScript types
   - Easiest method
   - No CLI setup needed
   - Generates all tables at once

2. **If that doesn't work:** Manual addition
   - Copy the types from this guide
   - Add to `types/supabase.ts`
   - Verify with `npm run type-check`

3. **For future:** Set up Supabase CLI
   - More automated
   - Can regenerate types easily
   - Better for long-term maintenance

---

## Next Steps After Updating Types

1. ✅ Run `npm run type-check` to verify
2. ✅ Test API route with new tables
3. ✅ Verify autocomplete works in VS Code
4. ✅ Commit updated types file

---

**Status:** Ready to update types  
**Method:** Choose automated (Dashboard) or manual (this guide)  
**Time:** 5-10 minutes

