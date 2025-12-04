# Email Templates for Client Discovery Workflow

This directory contains 5 professional email templates for the Rocky Web Studio client discovery workflow.

## Templates Overview

1. **discovery-immediate-auto-response.html** - Sent immediately when form is submitted
2. **discovery-24h-reminder.html** - Sent 24 hours before consultation
3. **discovery-48h-prep.html** - Sent 48 hours before consultation
4. **discovery-post-call-yes.html** - Sent if client wants to move forward
5. **discovery-post-call-maybe.html** - Sent if client needs time to decide

## Template Variables

All templates use the following variable placeholders (replace with actual values in n8n):

### Common Variables
- `{{companyName}}` - Client's company name
- `{{email}}` - Client's email address
- `{{unsubscribeLink}}` - Unsubscribe URL

### Immediate Auto-Response Variables
- `{{companyName}}`
- `{{industry}}`
- `{{budget}}`
- `{{featuresList}}` - Comma-separated list of features
- `{{pdfDownloadLink}}` - Link to download PDF summary
- `{{calendlyLink}}` - Link to schedule consultation
- `{{consultationDate}}` - Scheduled consultation date
- `{{consultationTime}}` - Scheduled consultation time
- `{{calendlyRescheduleLink}}` - Link to reschedule

### 24h Reminder Variables
- `{{consultationDate}}`
- `{{consultationTime}}`
- `{{timezone}}` - e.g., "AEST" or "UTC+10"
- `{{zoomLink}}` - Zoom meeting URL
- `{{calendlyRescheduleLink}}`

### 48h Prep Variables
- `{{consultationDate}}`
- `{{consultationTime}}`
- `{{timezone}}`
- `{{zoomLink}}`
- `{{calendlyRescheduleLink}}`

### Post-Call Yes Variables
- `{{contractLink}}` - Link to view/sign contract
- `{{paymentLink}}` - Link to make payment
- `{{depositAmount}}` - e.g., "$2,500"
- `{{depositPercentage}}` - e.g., "50"
- `{{kickoffDate}}` - Design kickoff date
- `{{estimatedCompletionDate}}` - Project completion date
- `{{designReviewDate}}` - Design review date
- `{{developmentStartDate}}` - Development start date

### Post-Call Maybe Variables
- `{{proposalLink}}` - Link to proposal
- `{{faqLink}}` - Link to FAQ page
- `{{followUpDate}}` - Suggested follow-up date
- `{{relevantCaseStudies}}` - Array of case study objects (optional)
- `{{openQuestions}}` - Array of Q&A objects (optional)

## Usage in n8n

### Method 1: Direct HTML (Recommended)
1. Copy the HTML content from the template file
2. In n8n Email node, select **"HTML"** as email type
3. Paste HTML into the message field
4. Replace variables using n8n expressions:
   ```javascript
   {{ $json.companyName }}
   {{ $json.email }}
   {{ $json.calendlyLink }}
   ```

### Method 2: Using Code Node
1. Create a Code node before Email node
2. Read template file and replace variables:
   ```javascript
   const template = `...`; // HTML template
   const html = template
     .replace(/\{\{companyName\}\}/g, $json.companyName)
     .replace(/\{\{email\}\}/g, $json.email);
   return { html };
   ```
3. Use `{{ $json.html }}` in Email node

### Method 3: External Template File
1. Store templates in a file storage service (S3, Google Drive, etc.)
2. Fetch template in n8n
3. Replace variables
4. Send email

## Variable Replacement Examples

### n8n Expression Syntax
```javascript
// Simple variable
{{ $json.companyName }}

// Nested object
{{ $json.formData.companyName }}

// Array join
{{ $json.features.join(', ') }}

// Conditional
{{ $json.budget || 'Not specified' }}

// Date formatting
{{ new Date($json.consultationDate).toLocaleDateString() }}
```

## Customization

### Brand Colors
All templates use Rocky Web Studio brand colors:
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Darker purple)
- Success: `#4CAF50` (Green)
- Background: `#ffffff` (White)
- Text: `#333333` (Dark gray)

### Fonts
- Primary font: System font stack (Arial, Helvetica, sans-serif)
- Fallback: System default

### Responsive Design
All templates are mobile-responsive and tested on:
- Desktop (600px+)
- Tablet (400-600px)
- Mobile (<400px)

## Testing

### Before Production
1. Replace all variables with test data
2. Send test emails to yourself
3. Check rendering in:
   - Gmail (desktop & mobile)
   - Outlook (desktop)
   - Apple Mail
   - Mobile email clients
4. Verify all links work
5. Check unsubscribe link functionality

### Test Variables
```javascript
{
  "companyName": "Test Company",
  "email": "test@example.com",
  "industry": "Technology",
  "budget": "$10,000 - $25,000",
  "featuresList": "E-commerce, Blog, Analytics",
  "consultationDate": "January 15, 2024",
  "consultationTime": "2:00 PM",
  "timezone": "AEST",
  "calendlyLink": "https://calendly.com/rockywebstudio/consultation",
  "zoomLink": "https://zoom.us/j/123456789",
  "contractLink": "https://example.com/contract/123",
  "paymentLink": "https://example.com/payment/123",
  "proposalLink": "https://example.com/proposal/123",
  "unsubscribeLink": "https://rockywebstudio.com.au/unsubscribe?token=abc123"
}
```

## Compliance

### GDPR/Privacy Compliance
- ✅ Unsubscribe link included in all emails
- ✅ Privacy policy link included
- ✅ Clear sender identification
- ✅ Contact information provided

### Email Best Practices
- ✅ Plain text fallback (add if needed)
- ✅ Clear subject lines
- ✅ Single CTA per email
- ✅ Mobile-responsive design
- ✅ Professional formatting

## Support

For questions or issues with email templates:
- Contact: hello@rockywebstudio.com.au
- Check n8n documentation: https://docs.n8n.io
- Review email rendering: https://www.emailonacid.com

## Version History

- **v1.0** (2024-01-01) - Initial release
  - All 5 templates created
  - Brand colors and styling applied
  - Mobile-responsive design
  - Variable placeholders added



