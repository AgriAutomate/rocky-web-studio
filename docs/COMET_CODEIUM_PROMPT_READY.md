# Comet Codeium Prompt - Ready to Use

## Copy This Prompt:

```
I need to update my Supabase TypeScript types file. I just added two new tables to my Supabase database:

1. `ai_assistant_conversations` - with columns: id (UUID), last_message (TEXT nullable), message_count (INTEGER default 0), client_ip (TEXT nullable), created_at (TIMESTAMPTZ default NOW()), updated_at (TIMESTAMPTZ default NOW())

2. `ai_assistant_messages` - with columns: id (UUID), conversation_id (UUID, foreign key to ai_assistant_conversations.id), role (TEXT CHECK: 'user' | 'assistant'), content (TEXT not null), created_at (TIMESTAMPTZ default NOW())

I want to use the automated method from Supabase Dashboard. Guide me through:
1. How to access the type generator in Supabase Dashboard (Settings → API → Generate TypeScript types)
2. How to copy the generated types
3. How to replace the contents of my types/supabase.ts file with the generated types
4. How to verify the types are correct (run npm run type-check)

Provide step-by-step instructions with exact navigation paths.
```

