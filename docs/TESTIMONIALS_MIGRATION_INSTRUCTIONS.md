# Testimonials Migration Instructions

## Error: Testimonials Table Not Found

If you're seeing an error like:
```
{message: "relation 'public.testimonials' does not exist", code: "42P01"}
```

This means the testimonials table hasn't been created yet. Follow these steps:

## Step 1: Run the Migration

### Option A: Using Supabase CLI (Recommended)

```bash
# If you have Supabase CLI installed
supabase db push

# Or run the migration directly
supabase migration up
```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20250127_create_testimonials_table.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option C: Direct SQL Execution

1. Connect to your Supabase database
2. Run the SQL from: `supabase/migrations/20250127_create_testimonials_table.sql`

## Step 2: Verify the Migration

After running the migration, verify the table exists:

```sql
SELECT * FROM testimonials LIMIT 1;
```

If this query runs without errors, the table has been created successfully.

## Step 3: Restart Your Dev Server

After running the migration, restart your Next.js dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Troubleshooting

### Error: "permission denied for table testimonials"

This means RLS policies are blocking access. The migration includes RLS policies, but if you're still seeing this:

1. Check that the migration ran completely (including the RLS policies)
2. Verify your Supabase service role key is set in environment variables
3. Check that the admin user has the correct role in `auth.users.raw_user_meta_data->>'role' = 'admin'`

### Error: "column does not exist"

This means the migration didn't run completely or there's a mismatch. Check:
1. All columns from the migration exist
2. The migration file matches the expected schema
3. No manual changes were made to the table structure

## Migration File Location

The migration file is located at:
```
supabase/migrations/20250127_create_testimonials_table.sql
```

## Next Steps

Once the migration is complete:
1. The error should disappear
2. You can access `/admin/testimonials` to create testimonials
3. Testimonials will appear on the homepage carousel
4. The `/testimonials` page will display all published testimonials

