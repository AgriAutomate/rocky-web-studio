# Website Audit System - Installation Notes

## Required Package Installation

The website audit system requires the `cheerio` package for HTML parsing:

```bash
npm install cheerio
npm install --save-dev @types/cheerio
```

## Environment Variables

Add to `.env.local`:

```bash
# Google PageSpeed API Key (required for performance metrics)
# Get from: https://console.cloud.google.com/apis/credentials
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here

# OR use alternative env var name:
GOOGLE_PAGESPEED_API_KEY=your_api_key_here

# Optional: Custom timeout (default: 30000ms)
AUDIT_TIMEOUT_MS=30000
```

## Database Migration

Run the migration to add audit columns:

```sql
-- File: supabase/migrations/20250122_add_audit_columns.sql
-- Run this in your Supabase SQL editor
```

## Testing

1. Submit a questionnaire with a website URL (q2 field)
2. Check database after 10-30 seconds for `audit_results`
3. Navigate to discovery page - audit should appear in sidebar

## Troubleshooting

### "cheerio is not defined"
- Run: `npm install cheerio @types/cheerio`

### "Google PageSpeed API key not configured"
- Add `NEXT_PUBLIC_GOOGLE_API_KEY` to `.env.local`
- Restart dev server

### Audit not running
- Check `website_url` is saved in database
- Check server logs for errors
- Verify API endpoint is accessible
