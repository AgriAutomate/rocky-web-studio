# AI Assistant Links & CTAs Guide
**Date:** January 26, 2025  
**Purpose:** Documentation of website links and call-to-action strategy

---

## 🔗 Website Links Available

### Primary CTAs (Always Include)

**Start a Project / Discovery Questionnaire:**
- URL: `https://rockywebstudio.com.au/questionnaire`
- When to use: End of every response, project inquiries, lead qualification
- Format: "Ready to get started? [Start your project](https://rockywebstudio.com.au/questionnaire)"

**Book a Consultation:**
- URL: `https://rockywebstudio.com.au/book`
- When to use: When suggesting consultations, complex projects
- Format: "Would you like to [book a consultation](https://rockywebstudio.com.au/book)?"

---

### Service Pages (Include When Relevant)

**Website Design & Development:**
- URL: `https://rockywebstudio.com.au/services/website-design-development`
- When to use: When discussing custom websites, web development

**Website Redesign:**
- URL: `https://rockywebstudio.com.au/services/website-redesign-refresh`
- When to use: When discussing website updates, redesigns

**E-Commerce Development:**
- URL: `https://rockywebstudio.com.au/services/ecommerce`
- When to use: When discussing online stores, e-commerce

**AI & Automation:**
- URL: `https://rockywebstudio.com.au/services/ai-automation`
- When to use: When discussing AI chatbots, automation

**CRM Integration:**
- URL: `https://rockywebstudio.com.au/services/crm-integration`
- When to use: When discussing CRM systems, integrations

**SEO & Performance:**
- URL: `https://rockywebstudio.com.au/services/seo-performance`
- When to use: When discussing SEO, performance optimization

**Support & Maintenance:**
- URL: `https://rockywebstudio.com.au/services/support-maintenance`
- When to use: When discussing ongoing support, maintenance

---

## 📋 Link Usage Guidelines

### Always Include "Start a Project" Link

**Every response should end with:**
- A call-to-action
- The "Start a Project" link: `https://rockywebstudio.com.au/questionnaire`
- Encouragement to begin the discovery process

**Example:**
"Ready to get started? [Start your project](https://rockywebstudio.com.au/questionnaire) and we'll create a custom proposal for you."

---

### Service-Specific Links

**When discussing a specific service:**
1. Provide information about the service
2. Include the relevant service page link
3. End with the "Start a Project" link

**Example:**
"We offer comprehensive e-commerce development services. Learn more about our [e-commerce solutions](https://rockywebstudio.com.au/services/ecommerce). Ready to get started? [Start your project](https://rockywebstudio.com.au/questionnaire)."

---

### Consultation Links

**When suggesting a consultation:**
- Include the booking link: `https://rockywebstudio.com.au/book`
- Also include the "Start a Project" link as primary CTA

**Example:**
"For complex projects, we recommend a consultation to discuss your specific needs. [Book a consultation](https://rockywebstudio.com.au/book) or [start your project](https://rockywebstudio.com.au/questionnaire) to get a custom proposal."

---

## 🎯 Response Structure

### Standard Response Format

1. **Answer the question** (if on-topic)
2. **Provide relevant information**
3. **Include service page link** (if discussing specific service)
4. **End with CTA** - Always include "Start a Project" link

### Example Response Structure

```
[Answer to question]

[Additional relevant information]

Learn more about [service]: [Service page link]

Ready to get started? [Start your project](https://rockywebstudio.com.au/questionnaire)
```

---

## 💡 Link Formatting Examples

### Markdown Format (What AI Should Use)

```markdown
[Start your project](https://rockywebstudio.com.au/questionnaire)
[Book a consultation](https://rockywebstudio.com.au/book)
[Learn about our e-commerce services](https://rockywebstudio.com.au/services/ecommerce)
```

### Actionable CTAs

**Good:**
- "Ready to get started? [Start your project](https://rockywebstudio.com.au/questionnaire)"
- "Learn more: [E-commerce Development](https://rockywebstudio.com.au/services/ecommerce)"
- "Book a time: [Schedule Consultation](https://rockywebstudio.com.au/book)"

**Avoid:**
- "Here's a link: https://rockywebstudio.com.au/questionnaire" (not actionable)
- Just the URL without context (not user-friendly)

---

## 🔄 Conversation Flow with Links

### Initial Question
**User:** "What services do you offer?"

**AI Response:**
"We offer a range of web development services including website design, e-commerce development, AI automation, and more. Learn about our [services](https://rockywebstudio.com.au/services/website-design-development). Ready to get started? [Start your project](https://rockywebstudio.com.au/questionnaire)."

### Service-Specific Question
**User:** "Do you build e-commerce websites?"

**AI Response:**
"Yes! We specialize in e-commerce development with payment processing, inventory management, and order tracking. Pricing ranges from $8,000 - $40,000 with timelines of 8-16 weeks. Learn more: [E-Commerce Development](https://rockywebstudio.com.au/services/ecommerce). Ready to discuss your project? [Start your project](https://rockywebstudio.com.au/questionnaire)."

### Project Inquiry
**User:** "I need a website for my business"

**AI Response:**
"Great! We'd love to help. Our website design and development services start at $4,000 and typically take 4-12 weeks. To create a custom proposal for your business, [start your project](https://rockywebstudio.com.au/questionnaire) and complete our discovery questionnaire. This helps us understand your needs and provide accurate pricing and timelines."

---

## ✅ Testing Checklist

When testing, verify:

- [ ] Every response includes "Start a Project" link
- [ ] Service-specific questions include relevant service page link
- [ ] Consultation suggestions include booking link
- [ ] Links are formatted as markdown (clickable)
- [ ] Links use full URLs (https://rockywebstudio.com.au/...)
- [ ] CTAs are actionable and clear
- [ ] Links are placed at the end of responses (after information)

---

## 📊 Link Tracking

**Primary Conversion Goal:**
- `/questionnaire` - Start a Project (main CTA)

**Secondary Goals:**
- `/book` - Book Consultation
- Service pages - Learn more about specific services

**Expected Behavior:**
- Every conversation should end with a push towards `/questionnaire`
- Service discussions should include relevant service page links
- Complex inquiries should offer both consultation and questionnaire options

---

**Last Updated:** January 26, 2025  
**Status:** ✅ Implemented  
**File:** `lib/knowledge-base.ts`

