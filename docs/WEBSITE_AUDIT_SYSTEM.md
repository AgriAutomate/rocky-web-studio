# Website Audit System Documentation

## Overview

Automated website audit system that analyzes client websites after questionnaire submission. Uses Google PageSpeed API for performance metrics and cheerio for HTML parsing. Results are stored in Postgres (JSONB) and displayed in the Discovery Tree sidebar.

## Architecture

### Design Decisions

- **Google PageSpeed API** instead of Puppeteer (lighter, more reliable, no timeout issues)
- **Async audit trigger** - Returns HTTP 202 immediately, audit runs in background (10-30 seconds)
- **cheerio + regex** for CMS detection (lightweight, 95% accurate)
- **Modular functions** - Each function has one job, easy to test and maintain

### Flow

1. Client submits questionnaire with website URL (q2)
2. Questionnaire saved to database
3. Audit triggered asynchronously (fire-and-forget)
4. Audit runs in background:
   - Fetches website HTML
   - Extracts tech stack (CMS, frameworks, analytics, etc.)
   - Gets PageSpeed metrics (mobile/desktop)
   - Parses SEO metadata
   - Analyzes content
   - Generates recommendations
5. Results saved to `audit_results` JSONB column
6. Discovery page fetches and displays results

## Database Schema

### Migration: `supabase/migrations/20250122_add_audit_columns.sql`

**New Columns:**
- `website_url TEXT` - Website URL from questionnaire (q2)
- `audit_results JSONB` - Complete audit results
- `audit_completed_at TIMESTAMP` - When audit completed
- `audit_error TEXT` - Error message if audit failed

**Indexes:**
- `audit_completed_at` (for querying completed audits)
- `audit_error` (for querying failed audits)
- `website_url` (for duplicate detection)
- `audit_results` (GIN index for JSONB queries)

## API Endpoints

### POST /api/audit-website

Triggers an asynchronous website audit.

**Request:**
```json
{
  "questionnaireResponseId": "123",
  "websiteUrl": "https://example.com"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "questionnaireResponseId": "123",
  "message": "Audit started. Results will be available shortly.",
  "auditStartedAt": "2025-01-22T10:30:00Z"
}
```

### GET /api/audit-website/get?questionnaireResponseId=123

Fetches stored audit results.

**Response (200 OK):**
```json
{
  "questionnaireResponseId": "123",
  "audit": {
    "websiteInfo": { ... },
    "techStack": { ... },
    "performance": { ... },
    "seo": { ... },
    "metadata": { ... },
    "contentAnalysis": { ... },
    "recommendations": [ ... ],
    "auditDate": "2025-01-22T10:30:15Z",
    "auditDurationMs": 12500
  },
  "auditCompletedAt": "2025-01-22T10:30:15Z"
}
```

**Response (404 Not Found):**
```json
{
  "questionnaireResponseId": "123",
  "message": "Audit not yet completed. Please check again shortly."
}
```

## Environment Variables

Add to `.env.local`:

```bash
# Google PageSpeed API Key (required for performance metrics)
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
# OR
GOOGLE_PAGESPEED_API_KEY=your_google_api_key_here

# Optional: Audit configuration
AUDIT_TIMEOUT_MS=30000  # Default: 30000 (30 seconds)
AUDIT_RETRY_COUNT=0     # Default: 0 (no retries)
```

### Getting Google PageSpeed API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "PageSpeed Insights API"
4. Create credentials (API Key)
5. Add to environment variables

**Note:** PageSpeed API is free with generous quotas (25,000 requests/day).

## Installation

### Required Package

Install cheerio for HTML parsing:

```bash
npm install cheerio
npm install --save-dev @types/cheerio
```

## Usage

### Automatic Trigger

Audit is automatically triggered when:
1. Questionnaire is submitted
2. Website URL (q2) is provided
3. URL is valid

### Manual Trigger

```typescript
const response = await fetch("/api/audit-website", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    questionnaireResponseId: "123",
    websiteUrl: "https://example.com",
  }),
});
```

### Fetch Results

```typescript
const response = await fetch(
  `/api/audit-website/get?questionnaireResponseId=123`
);
const data = await response.json();

if (data.audit) {
  console.log("Platform:", data.audit.techStack.cms?.name);
  console.log("Performance:", data.audit.performance.overallScore);
}
```

## Data Structure

### WebsiteAuditResult

Complete audit result containing:

- **websiteInfo**: URL, title, description, accessibility
- **techStack**: CMS, e-commerce, analytics, payment processors, frameworks
- **performance**: Mobile/desktop scores, LCP, TBT, CLS, etc.
- **seo**: Title tags, meta descriptions, structured data, alt tags
- **metadata**: Social profiles, contact info, language
- **contentAnalysis**: Word count, features detected (blog, e-commerce, etc.)
- **recommendations**: Prioritized list of improvements

### Example Audit Result

```json
{
  "websiteInfo": {
    "url": "https://example.com",
    "title": "Example Business",
    "isAccessible": true
  },
  "techStack": {
    "cms": {
      "name": "WordPress",
      "confidence": "high"
    },
    "analytics": [
      { "name": "Google Analytics", "confidence": "high" }
    ]
  },
  "performance": {
    "mobileScore": 65,
    "desktopScore": 80,
    "overallScore": 73
  },
  "seo": {
    "hasTitleTag": true,
    "hasMetaDescription": true,
    "httpsEnabled": true
  },
  "recommendations": [
    {
      "category": "performance",
      "priority": "high",
      "title": "Poor Mobile Performance",
      "description": "Mobile score is 65/100..."
    }
  ]
}
```

## UI Components

### AuditCard

Displays audit summary in discovery sidebar:

- Platform (CMS/framework detected)
- Performance score (with color coding)
- Mobile score
- Social profiles found
- Top priority issue
- Link to website

### Integration

AuditCard is automatically included in `SummarySidebar` component on discovery page.

## Error Handling

### Common Errors

1. **Invalid URL**: Returns 400 with error message
2. **Website unreachable**: Saved as `audit_error`, doesn't fail questionnaire
3. **PageSpeed API error**: Performance metrics missing, other data still collected
4. **Timeout**: 30-second timeout, error saved to database

### Error States

- **Loading**: Shows spinner while audit runs
- **Not Found**: Shows message that audit will be available shortly
- **Error**: Error message stored in `audit_error` column

## Performance Considerations

- **Async processing**: Audit runs in background, doesn't block questionnaire submission
- **Timeout**: 30-second timeout prevents hanging requests
- **Caching**: Consider caching results if same URL audited multiple times
- **Rate limiting**: Google PageSpeed API has quotas (25k/day free tier)

## Testing

### Manual Testing

1. Submit questionnaire with website URL
2. Check database for `audit_results` after 10-30 seconds
3. Navigate to discovery page
4. Verify AuditCard displays results

### Test URLs

- WordPress: `https://wordpress.org`
- Shopify: `https://shopify.com`
- Custom site: Your own website

## Troubleshooting

### Audit Not Running

- Check `website_url` is saved in database
- Check API endpoint is accessible
- Check Google API key is configured
- Check server logs for errors

### Missing Performance Metrics

- Verify Google API key is correct
- Check API quota hasn't been exceeded
- Verify URL is publicly accessible

### CMS Not Detected

- Some sites use custom builds (no CMS)
- Detection is ~95% accurate (regex-based)
- Can be extended with Wappalyzer API later

## Future Enhancements

1. **Wappalyzer Integration**: More accurate tech stack detection
2. **Caching**: Cache results for duplicate URLs
3. **Retry Logic**: Retry failed audits automatically
4. **Batch Audits**: Audit multiple URLs at once
5. **Historical Tracking**: Track performance over time
6. **Comparison**: Compare before/after improvements

## Files Created

- `supabase/migrations/20250122_add_audit_columns.sql` - Database schema
- `lib/types/audit.ts` - TypeScript types
- `lib/utils/audit-utils.ts` - Utility functions
- `lib/services/audit-service.ts` - Core audit logic
- `lib/services/audit-logging.ts` - Logging helpers
- `app/api/audit-website/route.ts` - POST endpoint
- `app/api/audit-website/get/route.ts` - GET endpoint
- `components/discovery/AuditCard.tsx` - UI component

## Files Updated

- `app/api/questionnaire/submit/route.ts` - Triggers audit on submit
- `lib/utils/supabase-client.ts` - Stores website_url
- `app/discovery/[id]/page.tsx` - Fetches and displays audit
- `components/discovery/SummarySidebar.tsx` - Includes AuditCard
- `components/discovery/DiscoveryTreeForm.tsx` - Passes audit props
