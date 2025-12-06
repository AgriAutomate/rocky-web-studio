# Supabase Database Setup

This directory contains database migrations for the Rocky Web Studio application.

## Quick Start

### 1. Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (with Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gtjhtmrtbinegydatrnx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get your credentials from:**
https://supabase.com/dashboard/project/gtjhtmrtbinegydatrnx/settings/api

### 3. Link to Your Supabase Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref gtjhtmrtbinegydatrnx
```

### 4. Run Migrations

**Option A: Using Supabase CLI (Recommended)**

```bash
# Push all migrations to your Supabase project
supabase db push

# Or apply migrations remotely
supabase migration up --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.gtjhtmrtbinegydatrnx.supabase.co:5432/postgres"
```

**Option B: Using Supabase Dashboard**

1. Go to https://supabase.com/dashboard/project/gtjhtmrtbinegydatrnx/editor
2. Open SQL Editor
3. Copy and paste the contents of `migrations/20251207000001_create_song_orders.sql`
4. Click "Run"

**Option C: Using psql (PostgreSQL CLI)**

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.gtjhtmrtbinegydatrnx.supabase.co:5432/postgres" -f migrations/20251207000001_create_song_orders.sql
```

## Database Schema

### Tables

#### `song_orders`
Stores all custom song order information.

**Columns:**
- `id` (UUID) - Primary key
- `order_id` (VARCHAR) - Unique order identifier (e.g., CS-12345)
- `stripe_payment_id` (VARCHAR) - Stripe Payment Intent ID
- `customer_name` (VARCHAR) - Customer's full name
- `customer_email` (VARCHAR) - Customer's email
- `customer_phone` (VARCHAR) - Customer's phone number
- `song_brief` (TEXT) - Customer's story/brief
- `generated_prompt` (TEXT) - AI-generated prompt for Suno
- `suno_url` (VARCHAR) - Direct link to song on Suno
- `suno_embed_url` (VARCHAR) - Embeddable player URL
- `status` (VARCHAR) - Order status (PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED)
- `package_type` (VARCHAR) - Package selected (express, standard, wedding)
- `occasion` (VARCHAR) - Event type
- `mood` (VARCHAR) - Song mood
- `genre` (VARCHAR) - Music genre
- `event_date` (DATE) - Event date
- `created_at` (TIMESTAMP) - Order creation timestamp
- `completed_at` (TIMESTAMP) - Order completion timestamp
- `notes` (TEXT) - Internal notes

**Indexes:**
- `order_id` (UNIQUE)
- `stripe_payment_id`
- `customer_email`
- `status`
- `created_at`

#### `song_order_audit`
Tracks all changes to song orders for accountability.

**Columns:**
- `id` (SERIAL) - Primary key
- `order_id` (UUID) - References song_orders.id
- `action` (VARCHAR) - Action performed (CREATED, UPDATED, DELETED)
- `timestamp` (TIMESTAMP) - When the action occurred
- `details` (JSONB) - JSON object with change details
- `user_email` (VARCHAR) - Who made the change
- `ip_address` (INET) - IP address of the requester

### Row Level Security (RLS)

**Enabled on both tables.**

**Policies:**
- Service role: Full access
- Authenticated users: Can read their own orders
- Anonymous users: Can insert new orders (for checkout)
- Audit logs: Service role only

### Automatic Audit Logging

A trigger automatically creates audit log entries when:
- An order is created (`CREATED` action)
- An order is updated (`UPDATED` action with old/new values)
- An order is deleted (`DELETED` action)

## Usage in Code

### Client-Side (Browser)

```typescript
import { supabase } from '@/lib/supabase/client';

// Create a new order (anonymous users allowed)
const { data, error } = await supabase
  .from('song_orders')
  .insert({
    order_id: 'CS-12345',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    song_brief: 'A birthday song for my mom',
    status: 'PENDING',
    package_type: 'standard',
  });

// Query orders (authenticated users only see their own)
const { data: orders } = await supabase
  .from('song_orders')
  .select('*')
  .eq('customer_email', userEmail)
  .order('created_at', { ascending: false });
```

### Server-Side (API Routes)

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/client';

// In API route
export async function POST(req: Request) {
  // Use service role for admin operations
  const supabase = createServerSupabaseClient(true);

  // Update order status
  const { data, error } = await supabase
    .from('song_orders')
    .update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      suno_url: 'https://suno.ai/song/...',
    })
    .eq('order_id', orderId);

  return Response.json({ data, error });
}
```

## Webhook Integration

When a Stripe payment succeeds, store the order in Supabase:

```typescript
// In your Stripe webhook handler
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object;
  const metadata = paymentIntent.metadata;

  const supabase = createServerSupabaseClient(true);

  await supabase.from('song_orders').insert({
    order_id: metadata.orderId,
    stripe_payment_id: paymentIntent.id,
    customer_name: metadata.customerName,
    customer_email: metadata.customerEmail,
    customer_phone: metadata.phone,
    song_brief: metadata.storyDetails,
    package_type: metadata.package,
    occasion: metadata.occasion,
    mood: metadata.mood,
    genre: metadata.genre,
    event_date: metadata.eventDate,
    status: 'PENDING',
  });
}
```

## Troubleshooting

### Migration fails with "relation already exists"

The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. If you need to reset:

```bash
# WARNING: This will delete all data
DROP TABLE IF EXISTS song_order_audit CASCADE;
DROP TABLE IF EXISTS song_orders CASCADE;
```

### Can't connect to database

1. Check your credentials in `.env.local`
2. Verify your IP is allowed in Supabase Dashboard → Settings → Database → Connection Pooling
3. Ensure you're using the correct project URL

### RLS preventing queries

If you're getting permission errors:
- Client-side: Make sure you're authenticated or the policy allows anon access
- Server-side: Use `createServerSupabaseClient(true)` to bypass RLS with service role

## NPM Scripts (Optional)

Add these to your `package.json`:

```json
{
  "scripts": {
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:status": "supabase status",
    "supabase:push": "supabase db push",
    "supabase:reset": "supabase db reset",
    "supabase:generate-types": "supabase gen types typescript --project-id gtjhtmrtbinegydatrnx > types/supabase.ts"
  }
}
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)
