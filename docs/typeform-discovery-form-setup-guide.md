# Typeform Client Discovery Form - Complete Setup Guide

This guide provides step-by-step instructions for creating and configuring the Rocky Web Studio client discovery form on Typeform.

---

## Table of Contents

1. [Form Structure](#1-form-structure)
2. [Branching Logic](#2-branching-logic-conditional-display)
3. [Branding](#3-branding)
4. [Form Settings](#4-form-settings)
5. [Integrations](#5-integrations)
6. [Testing](#6-testing)

---

## 1. Form Structure

### Step 1.1: Create New Form

1. Log in to Typeform at https://www.typeform.com
2. Click **"Create a typeform"**
3. Select **"Start from scratch"**
4. Name your form: **"Rocky Web Studio - Client Discovery"**
5. Click **"Create typeform"**

---

### Step 1.2: Section 1 - Welcome & Company Basics

**Question 1: Welcome Screen**
- **Type:** Statement
- **Text:**
  ```
  🎯 Welcome to Rocky Web Studio's Discovery Form
  
  We're excited to learn about your project! This form will take about 5-7 minutes to complete.
  
  Your responses help us understand your needs and prepare a tailored proposal for you.
  ```
- **Button Text:** "Let's Get Started"
- **Settings:** 
  - Show progress bar: ✅ Yes
  - Randomize: ❌ No

---

**Question 2: Company Name**
- **Type:** Short text
- **Question:** `What's your company name?`
- **Help text:** `The legal or trading name of your business`
- **Required:** ✅ Yes
- **Validation:** Text only, max 100 characters
- **Placeholder:** `e.g., Acme Corporation`

---

**Question 3: Your Email**
- **Type:** Email
- **Question:** `What's your email address?`
- **Help text:** `We'll use this to send your consultation summary and schedule a call`
- **Required:** ✅ Yes
- **Validation:** Valid email format
- **Placeholder:** `your.email@company.com`

---

**Question 4: Company Size**
- **Type:** Multiple choice
- **Question:** `How many employees does your company have?`
- **Help text:** `This helps us understand the scale of your project`
- **Required:** ✅ Yes
- **Options:**
  - `Solo (Just me)`
  - `2-5 employees`
  - `6-20 employees`
  - `21-50 employees`
  - `51-200 employees`
  - `200+ employees`
- **Randomize options:** ❌ No

---

**Question 5: Industry**
- **Type:** Dropdown
- **Question:** `What industry are you in?`
- **Help text:** `Select the industry that best describes your business`
- **Required:** ✅ Yes
- **Options:**
  ```
  Retail / E-commerce
  Healthcare
  Finance / Banking
  Education
  Technology / SaaS
  Real Estate
  Hospitality / Tourism
  Manufacturing
  Professional Services
  Non-profit
  Other (please specify)
  ```
- **Allow "Other" option:** ✅ Yes (with text field)

---

### Step 1.3: Section 2 - Business Goals

**Question 6: Main Problem**
- **Type:** Long text
- **Question:** `What's the main problem or challenge you're trying to solve?`
- **Help text:** `Describe the primary issue your website or digital solution needs to address`
- **Required:** ✅ Yes
- **Character limit:** 500
- **Placeholder:** `e.g., We need to increase online sales by 30% and improve customer engagement...`

---

**Question 7: Success Metric**
- **Type:** Long text
- **Question:** `How will you measure success?`
- **Help text:** `What specific outcomes or metrics will indicate this project was successful?`
- **Required:** ✅ Yes
- **Character limit:** 500
- **Placeholder:** `e.g., Increase website traffic by 50%, reduce bounce rate to under 30%, generate 100 qualified leads per month...`

---

**Question 8: Target Customer**
- **Type:** Short text
- **Question:** `Who is your ideal customer or target audience?`
- **Help text:** `Describe your primary customer demographic or persona`
- **Required:** ✅ Yes
- **Character limit:** 200
- **Placeholder:** `e.g., Small business owners aged 35-55 looking to expand online...`

---

### Step 1.4: Section 3 - Design & Brand

**Question 9: Brand Personality**
- **Type:** Multiple choice (multiple selection)
- **Question:** `Which words best describe your brand personality?`
- **Help text:** `Select all that apply - this helps us design something that matches your brand`
- **Required:** ✅ Yes (at least 1 selection)
- **Options:**
  ```
  Professional
  Creative
  Modern
  Friendly
  Luxury
  Minimalist
  Bold
  Trustworthy
  Innovative
  Traditional
  ```
- **Randomize options:** ❌ No
- **Min selections:** 1
- **Max selections:** 5

---

**Question 10: Design Inspiration**
- **Type:** Website
- **Question:** `Do you have any websites or designs you like? (Optional)`
- **Help text:** `Share links to websites, designs, or portfolios that inspire you`
- **Required:** ❌ No
- **Allow multiple URLs:** ✅ Yes (up to 3)
- **Placeholder:** `https://example.com`

---

**Question 11: Content Readiness**
- **Type:** Multiple choice
- **Question:** `How ready is your content?`
- **Help text:** `This helps us plan the project timeline`
- **Required:** ✅ Yes
- **Options:**
  ```
  We have all content ready (text, images, etc.)
  We have some content, but need help with the rest
  We need help creating most of our content
  We're starting from scratch
  ```
- **Randomize options:** ❌ No

---

### Step 1.5: Section 4 - Features & Technology

**Question 12: Required Features**
- **Type:** Multiple choice (multiple selection)
- **Question:** `What features does your project need?`
- **Help text:** `Select all features that apply to your project`
- **Required:** ✅ Yes (at least 1 selection)
- **Options:**
  ```
  E-commerce / Online Store
  Blog / Content Management System
  Booking / Appointment System
  Contact Forms
  Membership / User Accounts
  Customer Portal
  Analytics Integration
  SEO Optimization
  Multi-language Support
  Mobile App
  API Integration
  Custom Dashboard
  ```
- **Randomize options:** ❌ No
- **Min selections:** 1

---

**Question 13: Integrations Needed**
- **Type:** Multiple choice (multiple selection)
- **Question:** `What integrations do you need? (Optional)`
- **Help text:** `Select any third-party services you want to connect`
- **Required:** ❌ No
- **Options:**
  ```
  Payment Gateway (Stripe, PayPal, etc.)
  CRM Integration (HubSpot, Salesforce, etc.)
  Email Marketing (Mailchimp, ConvertKit, etc.)
  Social Media Integration
  Accounting Software (QuickBooks, Xero, etc.)
  Inventory Management
  Shipping Integration
  Live Chat / Support
  Other (please specify)
  ```
- **Randomize options:** ❌ No

---

**Question 14: AI Features Interest**
- **Type:** Multiple choice (multiple selection)
- **Question:** `Are you interested in any AI-powered features? (Optional)`
- **Help text:** `Select any AI features that interest you`
- **Required:** ❌ No
- **Options:**
  ```
  AI Chatbot / Virtual Assistant
  AI Content Generation
  AI Personalization
  AI Analytics & Insights
  AI Image Generation
  AI Search / Recommendations
  Not interested in AI features
  ```
- **Randomize options:** ❌ No

---

### Step 1.6: Section 5 - Budget & Timeline

**Question 15: Budget Range**
- **Type:** Multiple choice
- **Question:** `What's your budget range for this project?`
- **Help text:** `This helps us recommend the right solution for your needs`
- **Required:** ✅ Yes
- **Options:**
  ```
  Under $2,000
  $2,000 - $5,000
  $5,000 - $10,000
  $10,000 - $25,000
  $25,000 - $50,000
  $50,000+
  Prefer not to say
  ```
- **Randomize options:** ❌ No

---

**Question 16: Target Launch Date**
- **Type:** Date
- **Question:** `When do you need this project completed? (Optional)`
- **Help text:** `If you have a specific deadline, let us know`
- **Required:** ❌ No
- **Date format:** MM/DD/YYYY
- **Min date:** Today
- **Max date:** 2 years from today

---

**Question 17: Additional Notes**
- **Type:** Long text
- **Question:** `Anything else we should know? (Optional)`
- **Help text:** `Share any additional information, requirements, or questions`
- **Required:** ❌ No
- **Character limit:** 1000
- **Placeholder:** `Any special requirements, constraints, or questions...`

---

### Step 1.7: Section 6 - Review & Submit

**Question 18: Consent & Privacy**
- **Type:** Yes/No
- **Question:** `I consent to Rocky Web Studio using this information to prepare a proposal and contact me regarding my project.`
- **Help text:** `[Privacy Policy](https://rockywebstudio.com.au/privacy) - We respect your privacy and will only use this information for project purposes.`
- **Required:** ✅ Yes
- **Options:**
  - `Yes, I consent`
  - `No` (if No, show message: "Consent is required to proceed")

---

**Question 19: Thank You Screen**
- **Type:** Statement
- **Text:**
  ```
  🎉 Thank You!
  
  We've received your discovery form and are excited to learn more about your project.
  
  What happens next:
  
  1. 📧 You'll receive an email with your consultation summary (check your inbox!)
  2. 📅 We'll send you a link to book a free consultation call
  3. 🎯 We'll review your submission and prepare a tailored proposal
  
  Questions? Contact us at hello@rockywebstudio.com.au
  
  We look forward to working with you!
  
  — Diamonds McFly & The Rocky Web Studio Team
  ```
- **Button Text:** "Visit Our Website"
- **Button Link:** `https://rockywebstudio.com.au`

---

## 2. Branching Logic (Conditional Display)

### Step 2.1: E-commerce Branching

**IF "E-commerce / Online Store" is selected in Question 12:**

**Add Question 12A: Payment Processing**
- **Type:** Multiple choice
- **Question:** `What payment methods do you need?`
- **Help text:** `Select all payment options you want to offer customers`
- **Required:** ✅ Yes
- **Options:**
  ```
  Credit/Debit Cards
  PayPal
  Apple Pay / Google Pay
  Buy Now Pay Later (Afterpay, Klarna, etc.)
  Bank Transfer
  Cryptocurrency
  ```
- **Show this question:** Only if "E-commerce / Online Store" is selected in Question 12

**Add Question 12B: Inventory Management**
- **Type:** Yes/No
- **Question:** `Do you need inventory management?`
- **Help text:** `Track stock levels, low stock alerts, etc.`
- **Required:** ✅ Yes
- **Show this question:** Only if "E-commerce / Online Store" is selected in Question 12

---

### Step 2.2: Budget Branching

**IF Budget < $2,000 in Question 15:**

**Add Question 15A: Basic Features Notice**
- **Type:** Statement
- **Text:**
  ```
  💡 Budget-Friendly Options Available
  
  With a budget under $2,000, we can help you with:
  
  • Simple website design & development
  • Basic SEO optimization
  • Essential integrations
  • Mobile-responsive design
  
  We'll work with you to prioritize the most important features for your budget.
  ```
- **Show this question:** Only if "Under $2,000" is selected in Question 15

---

### Step 2.3: AI Features Branching

**IF "Not interested in AI features" is selected in Question 14:**

**Skip Question 14A (AI Customization)**
- This question will be hidden automatically

**IF any AI feature is selected in Question 14:**

**Add Question 14A: AI Customization**
- **Type:** Long text
- **Question:** `Tell us more about your AI feature requirements`
- **Help text:** `Describe how you'd like to use AI features in your project`
- **Required:** ❌ No
- **Show this question:** Only if any AI feature (except "Not interested") is selected in Question 14

---

### Step 2.4: Company Size Branching

**IF "Solo (Just me)" is selected in Question 4:**

**Add Question 4A: Solo Business Focus**
- **Type:** Multiple choice
- **Question:** `What's your primary focus as a solo business?`
- **Help text:** `This helps us tailor our recommendations`
- **Required:** ✅ Yes
- **Options:**
  ```
  Getting started / Launching
  Growing my online presence
  Automating my business processes
  Reaching more customers
  Building credibility
  ```
- **Show this question:** Only if "Solo (Just me)" is selected in Question 4

---

### Step 2.5: Setting Up Branching Logic in Typeform

1. **Select the question** you want to add branching to
2. Click **"Add logic"** button (bottom of question)
3. Choose **"Jump to"** or **"Show question"**
4. Set condition:
   - **IF** [Question 12] **contains** "E-commerce / Online Store"
   - **THEN** show Question 12A
5. Click **"Save logic"**
6. Repeat for all branching scenarios

**Example Logic Rules:**

```
Rule 1:
IF Question 12 (Required Features) contains "E-commerce / Online Store"
THEN Show Question 12A (Payment Processing)
AND Show Question 12B (Inventory Management)

Rule 2:
IF Question 15 (Budget Range) equals "Under $2,000"
THEN Show Question 15A (Basic Features Notice)

Rule 3:
IF Question 14 (AI Features) contains any option EXCEPT "Not interested in AI features"
THEN Show Question 14A (AI Customization)

Rule 4:
IF Question 4 (Company Size) equals "Solo (Just me)"
THEN Show Question 4A (Solo Business Focus)
```

---

## 3. Branding

### Step 3.1: Upload Logo

1. Go to **"Design"** tab in Typeform editor
2. Click **"Logo"** section
3. Click **"Upload logo"**
4. Upload Rocky Web Studio logo (PNG with transparent background recommended)
5. **Size:** 200x50px (or proportional)
6. **Position:** Top center
7. Click **"Save"**

---

### Step 3.2: Brand Colors

1. In **"Design"** tab, click **"Colors"**
2. Select **"Custom"** theme
3. Set colors:
   - **Primary color:** `#667eea` (Purple)
   - **Secondary color:** `#764ba2` (Darker purple)
   - **Background:** `#ffffff` (White)
   - **Text:** `#333333` (Dark gray)
   - **Accent:** `#4CAF50` (Green for success)

4. **Background Style:**
   - Select **"Gradient"**
   - **Gradient colors:** 
     - Start: `#667eea`
     - End: `#764ba2`
   - **Direction:** Diagonal (135deg)

5. Click **"Apply"**

---

### Step 3.3: Typography

1. In **"Design"** tab, click **"Fonts"**
2. **Heading font:** Inter or Roboto (modern, professional)
3. **Body font:** Inter or Open Sans (readable)
4. **Font size:** Medium (16px for body)
5. Click **"Save"**

---

### Step 3.4: Custom Thank You Page

1. Go to **"Thank you screen"** (Question 19)
2. Click **"Edit"**
3. Add custom text (see Question 19 in Section 1.7)
4. **Button settings:**
   - **Text:** "Visit Our Website"
   - **Link:** `https://rockywebstudio.com.au`
   - **Style:** Primary button (purple gradient)

---

### Step 3.5: Privacy Policy Link

1. Go to **"Settings"** → **"Privacy & Legal"**
2. Enable **"Privacy policy"**
3. **Privacy policy URL:** `https://rockywebstudio.com.au/privacy`
4. **Link text:** "Privacy Policy"
5. **Display:** Show in footer

---

### Step 3.6: Footer Contact Info

1. Go to **"Settings"** → **"Branding"**
2. Scroll to **"Footer"**
3. Enable **"Show footer"**
4. **Footer text:**
   ```
   Rocky Web Studio | hello@rockywebstudio.com.au | rockywebstudio.com.au
   ```
5. **Footer style:** Small text, centered, gray color

---

## 4. Form Settings

### Step 4.1: General Settings

1. Go to **"Settings"** → **"General"**
2. **Form settings:**
   - **Allow resume later:** ✅ Yes
   - **Require email to resume:** ✅ Yes
   - **Progress bar:** ✅ Enabled
   - **Randomize questions:** ❌ Disabled
   - **RTL language:** ❌ Disabled
   - **Mobile optimization:** ✅ Enabled (verify responsive)

---

### Step 4.2: Submission Settings

1. Go to **"Settings"** → **"After submission"**
2. **Settings:**
   - **Show progress:** ✅ Yes
   - **Allow multiple submissions:** ✅ Yes (same person can submit again)
   - **Redirect URL:** Leave blank (use thank you screen)
   - **Auto-submit:** ❌ No

---

### Step 4.3: Notifications

1. Go to **"Settings"** → **"Notifications"**
2. **Email notifications:**
   - **Send to:** `team@rockywebstudio.com.au`
   - **When:** Every submission
   - **Include:** Full response data
   - **Format:** HTML email

---

### Step 4.4: Security & Privacy

1. Go to **"Settings"** → **"Security"**
2. **Settings:**
   - **Require password:** ❌ No (public form)
   - **Limit responses:** ❌ No
   - **Spam protection:** ✅ Enabled (reCAPTCHA)
   - **Data retention:** 12 months (or per your policy)

---

## 5. Integrations

### Step 5.1: Webhook Setup (for n8n)

1. Go to **"Connect"** tab in Typeform editor
2. Click **"Webhooks"**
3. Click **"Add webhook"**
4. **Webhook URL:** 
   ```
   https://your-n8n-instance.com/webhook/discovery-form
   ```
   (Replace with your actual n8n webhook URL)

5. **Event:** Select **"Form response"**
6. **Secret:** (Optional) Add webhook secret for security
7. **Test webhook:** Click **"Send test"** to verify connection
8. Click **"Save"**

**Webhook Payload Structure:**
```json
{
  "event_id": "abc123",
  "event_type": "form_response",
  "form_response": {
    "form_id": "your-form-id",
    "token": "response-token",
    "submitted_at": "2024-01-01T12:00:00Z",
    "answers": [
      {
        "field": {
          "id": "companyName",
          "type": "short_text",
          "ref": "company_name"
        },
        "type": "text",
        "text": "Acme Corporation"
      }
    ]
  }
}
```

---

### Step 5.2: Zapier Integration (Alternative)

1. Go to **"Connect"** → **"Zapier"**
2. Click **"Connect Zapier"**
3. Follow Zapier setup:
   - **Trigger:** "New Submission in Typeform"
   - **Action:** Choose your integration (Google Sheets, Slack, etc.)
4. **Test connection** and enable Zap

---

### Step 5.3: Email Notifications

1. Go to **"Settings"** → **"Notifications"**
2. **Email notifications:**
   - **Recipients:** 
     ```
     team@rockywebstudio.com.au
     hello@rockywebstudio.com.au
     ```
   - **Subject:** `New Discovery Form Submission - {{companyName}}`
   - **Template:** Use default or customize
   - **Include:** Full response data

3. **Test email:** Submit test form and verify email received

---

### Step 5.4: Google Sheets Integration (Optional)

1. Go to **"Connect"** → **"Google Sheets"**
2. Click **"Connect"**
3. **Select spreadsheet:** Choose or create "Client Discovery Leads"
4. **Map fields:**
   - Company Name → Column A
   - Email → Column B
   - Budget → Column C
   - Features → Column D
   - etc.
5. Click **"Save"**

---

## 6. Testing

### Step 6.1: Generate Test Link

1. Go to **"Share"** tab
2. Click **"Test link"**
3. Copy the test link (e.g., `https://form.typeform.com/to/ABC123?typeform-source=test`)
4. Share with team for testing

---

### Step 6.2: Test Scenarios

**Scenario 1: Under $2K Budget**
1. Fill out form with:
   - Company: "Test Company A"
   - Budget: "Under $2,000"
   - Features: "Blog / Content Management System"
   - No AI features
2. **Verify:**
   - ✅ Basic Features Notice appears
   - ✅ AI Customization question is hidden
   - ✅ Form submits successfully

---

**Scenario 2: E-commerce with AI**
1. Fill out form with:
   - Company: "Test Company B"
   - Budget: "$10,000 - $25,000"
   - Features: "E-commerce / Online Store"
   - AI Features: "AI Chatbot"
2. **Verify:**
   - ✅ Payment Processing question appears
   - ✅ Inventory Management question appears
   - ✅ AI Customization question appears
   - ✅ Form submits successfully

---

**Scenario 3: Solo Business**
1. Fill out form with:
   - Company Size: "Solo (Just me)"
   - All other fields filled
2. **Verify:**
   - ✅ Solo Business Focus question appears
   - ✅ Form submits successfully

---

### Step 6.3: Webhook Testing

1. **Submit test form** (use test link)
2. **Check n8n:**
   - Go to n8n workflow executions
   - Verify webhook received data
   - Check execution completed successfully
3. **Verify data:**
   - Check Slack notification sent
   - Check Google Sheets row added
   - Check email sent to client

---

### Step 6.4: Email Auto-Response Testing

1. **Submit form** with valid email
2. **Check email inbox:**
   - Look for subject: "Your Discovery Form Received – Consultation Summary Inside"
   - Verify PDF attachment included
   - Verify Calendly link works
   - Check email formatting

---

### Step 6.5: Mobile Responsiveness Testing

1. **Open test link on mobile device** (or use browser dev tools)
2. **Test on:**
   - iPhone (Safari)
   - Android (Chrome)
   - Tablet (iPad)
3. **Verify:**
   - ✅ All questions display correctly
   - ✅ Buttons are tappable (min 44px height)
   - ✅ Text is readable (16px minimum)
   - ✅ Progress bar visible
   - ✅ Form submits successfully

---

### Step 6.6: Final Checklist

Before going live, verify:

- [ ] All questions are in correct order
- [ ] Required fields are marked
- [ ] Branching logic works correctly
- [ ] Logo displays correctly
- [ ] Brand colors applied
- [ ] Thank you page shows correctly
- [ ] Privacy policy link works
- [ ] Footer displays correctly
- [ ] Webhook fires to n8n
- [ ] Email notifications work
- [ ] Test submissions work
- [ ] Mobile responsive
- [ ] All integrations connected
- [ ] Form is public (or password-protected if needed)

---

## 7. Going Live

### Step 7.1: Publish Form

1. Go to **"Share"** tab
2. Click **"Publish"**
3. Copy the **public link:**
   ```
   https://form.typeform.com/to/YOUR_FORM_ID
   ```
4. **Embed code** (if needed):
   - Click **"Embed"**
   - Copy embed code
   - Add to your website

---

### Step 7.2: Share Form

**Add to website:**
- Create a page: `/services/discovery` or `/get-started`
- Add form embed or link
- Add CTA button: "Start Discovery Form"

**Share via email:**
- Include in email campaigns
- Add to email signature

**Social media:**
- Share link on social platforms
- Add to bio links

---

## 8. Monitoring & Maintenance

### Step 8.1: Monitor Submissions

1. **Typeform dashboard:**
   - Check **"Results"** tab regularly
   - Review submission quality
   - Identify common issues

2. **n8n workflow:**
   - Monitor execution logs
   - Check for failed executions
   - Review error messages

---

### Step 8.2: Update Form

**When to update:**
- Add new features/services
- Update pricing/budget ranges
- Change branding
- Add new questions
- Update integrations

**How to update:**
1. Edit form in Typeform
2. Test changes thoroughly
3. Update n8n workflow if needed
4. Re-test webhook integration

---

## Troubleshooting

### Webhook Not Firing
- **Check:** Webhook URL is correct
- **Check:** n8n workflow is active
- **Check:** Typeform webhook is enabled
- **Test:** Use Typeform's "Send test" feature

### Branching Logic Not Working
- **Check:** Logic rules are saved
- **Check:** Condition matches exactly (case-sensitive)
- **Test:** Submit form with different answers

### Email Not Sending
- **Check:** Email address is valid
- **Check:** n8n email node is configured
- **Check:** SMTP credentials are correct
- **Test:** Send test email from n8n

### Mobile Issues
- **Check:** Font sizes are 16px minimum
- **Check:** Buttons are large enough (44px min)
- **Check:** Form uses responsive design
- **Test:** On actual devices, not just emulators

---

## Support Resources

- **Typeform Help Center:** https://help.typeform.com
- **Typeform Community:** https://community.typeform.com
- **n8n Documentation:** https://docs.n8n.io
- **Rocky Web Studio Support:** hello@rockywebstudio.com.au

---

## Form Summary

**Total Questions:** 19 (including welcome and thank you screens)
**Estimated Time:** 5-7 minutes
**Required Fields:** 12
**Optional Fields:** 7
**Branching Rules:** 4 conditional paths
**Integrations:** Webhook (n8n), Email notifications, Google Sheets (optional)

**Form Status:** ✅ Ready for production after testing

---

**Last Updated:** 2024-01-01
**Version:** 1.0



