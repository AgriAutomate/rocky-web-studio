# Discovery Form Email Campaign - Summary

Complete email campaign sequence for promoting the discovery form to potential clients.

---

## Campaign Overview

**Goal:** Drive discovery form submissions  
**Sequence:** 3 emails over 7 days  
**Target:** Potential clients who expressed interest  
**CTA:** Complete discovery form

---

## Email 1: Initial Outreach (Day 1)

### Subject Line
```
[First Name], Let's Talk About Your Website Project
```

### Preview Text
```
Get a custom proposal in 24 hours - just 5 minutes to complete
```

### Goal
Introduce Rocky Web Studio and link to discovery form

### Key Elements
- Brief value proposition
- Discovery form link (prominent CTA)
- What happens next (4-step process)
- No pressure messaging

### Variables
- `{{firstName}}` - Recipient's first name
- `{{discoveryFormLink}}` - Link to discovery form
- `{{unsubscribeLink}}` - Unsubscribe URL

### Send Criteria
- New leads in database
- Prospects who haven't submitted form
- Businesses that expressed interest

---

## Email 2: Form Reminder (Day 3)

### Subject Line
```
Quick Question: Did You Have a Chance to Fill Out Our Brief?
```

### Preview Text
```
Just 2 minutes - we promise it's quick!
```

### Goal
Gentle reminder for those who opened but didn't submit

### Key Elements
- 2-minute time estimate (emphasized)
- Direct form link
- Brief FAQ (3 questions)
- Reassurance about obligation

### Variables
- `{{firstName}}` - Recipient's first name
- `{{discoveryFormLink}}` - Link to discovery form
- `{{unsubscribeLink}}` - Unsubscribe URL

### Send Criteria
- Opened Email 1 but didn't submit form
- No form submission in last 3 days
- Not unsubscribed

---

## Email 3: Follow-Up (Day 7)

### Subject Line
```
What I Learned About [Their Industry] Website Trends
```

### Preview Text
```
Industry insights + case studies you'll find valuable
```

### Goal
Build credibility while waiting for form completion

### Key Elements
- Industry-specific insights (3 trends)
- Relevant case study
- Form link (subtle CTA)
- Educational value

### Variables
- `{{firstName}}` - Recipient's first name
- `{{industry}}` - Their industry
- `{{similarCompanyName}}` - Similar case study company
- `{{commonProblem}}` - Industry-specific problem
- `{{solution1}}`, `{{solution2}}`, `{{solution3}}` - Solutions
- `{{result}}` - Case study result
- `{{timeframe}}` - Time to achieve result
- `{{discoveryFormLink}}` - Link to discovery form
- `{{unsubscribeLink}}` - Unsubscribe URL

### Send Criteria
- Opened previous emails but didn't submit
- No form submission in last 7 days
- Industry data available
- Not unsubscribed

---

## Landing Page: Discovery Form Landing

### URL
```
https://rockywebstudio.com.au/discovery-form
```

### Headline
```
Let's Build Your Web Project – 5 Minutes to a Custom Proposal
```

### Subheading
```
Answer a few questions and we'll create a custom proposal tailored to your business.
```

### Sections

1. **Why We Ask**
   - Explains purpose of form
   - Sets expectations

2. **Time Estimate**
   - "Takes just 5-8 minutes"
   - Emphasizes quick process

3. **What Happens Next**
   - 4-step process
   - Clear expectations

4. **Security/Privacy**
   - Data security assurance
   - Privacy policy link

5. **Benefits Callouts**
   - Custom proposal within 24 hours
   - Budget and timeline aligned
   - Built for Central Queensland

6. **Trust Signals**
   - 100+ Happy Clients
   - Industry Leaders in AI Automation
   - Rockhampton-Based Since 2020

7. **FAQ Section**
   - 5 common questions
   - Addresses concerns

### CTA Button
- **Text:** "Start My Discovery Form"
- **Color:** Bright green (#4CAF50)
- **Size:** Large (20px font, 20px/50px padding)
- **Position:** Top and bottom of page

---

## Campaign Metrics to Track

### Email Metrics
- Open rate (target: >25%)
- Click-through rate (target: >5%)
- Form submission rate (target: >2%)
- Unsubscribe rate (target: <1%)

### Landing Page Metrics
- Page views
- Time on page
- Form start rate
- Form completion rate
- Bounce rate

### Conversion Funnel
1. Email sent
2. Email opened
3. Link clicked
4. Landing page viewed
5. Form started
6. Form completed
7. Consultation scheduled

---

## Segmentation

### Segment 1: New Leads
- **Email:** Initial Outreach
- **Timing:** Day 1
- **Goal:** Introduce and drive form submission

### Segment 2: Opened But Didn't Submit
- **Email:** Form Reminder
- **Timing:** Day 3
- **Goal:** Remind and reduce friction

### Segment 3: Engaged But Not Converted
- **Email:** Follow-Up with Value
- **Timing:** Day 7
- **Goal:** Build trust and provide value

---

## A/B Testing Ideas

### Subject Lines
- Personalization vs. Generic
- Question vs. Statement
- Benefit-focused vs. Curiosity-driven

### CTA Buttons
- Green vs. Purple gradient
- "Start Form" vs. "Get Proposal"
- Button size variations

### Email Content
- Short vs. Long copy
- With vs. without case studies
- Single vs. multiple CTAs

---

## Best Practices

### Email Timing
- **Day 1:** Tuesday-Thursday, 10 AM - 2 PM
- **Day 3:** Tuesday-Thursday, 10 AM - 2 PM
- **Day 7:** Tuesday-Thursday, 10 AM - 2 PM

### Personalization
- Use first name in subject and body
- Reference their industry
- Mention specific pain points if known

### Mobile Optimization
- Responsive email design
- Large CTA buttons (min 44px)
- Short subject lines (<50 chars)
- Single column layout

---

## Automation Setup

### Email Service Provider (ESP)

**Recommended:** Mailchimp, ConvertKit, or Resend

**Setup:**
1. Create email sequence
2. Set up automation triggers
3. Configure delays (Day 1, Day 3, Day 7)
4. Set up segmentation rules
5. Test email delivery

### n8n Workflow

**Trigger:** New lead added to database

**Actions:**
1. Add to email sequence
2. Send Email 1 (Day 1)
3. Track opens/clicks
4. Send Email 2 if opened but not submitted (Day 3)
5. Send Email 3 if engaged but not submitted (Day 7)
6. Remove from sequence if form submitted

---

## Compliance

### CAN-SPAM / GDPR
- ✅ Clear sender identification
- ✅ Unsubscribe link in every email
- ✅ Physical mailing address (if required)
- ✅ Privacy policy link
- ✅ Consent management

### Best Practices
- ✅ Double opt-in recommended
- ✅ Easy unsubscribe process
- ✅ Clear value proposition
- ✅ No spam trigger words
- ✅ Respect unsubscribe requests immediately

---

## Support Files

- **Email 1 HTML:** `discovery-form-initial-outreach.html`
- **Email 2 HTML:** `discovery-form-reminder.html`
- **Email 3 HTML:** `discovery-form-follow-up.html`
- **Landing Page:** `discovery-form-landing.html`

---

## Next Steps

1. **Customize Templates:**
   - Update form link URLs
   - Add industry-specific content
   - Customize case studies

2. **Set Up Automation:**
   - Configure ESP sequences
   - Set up tracking
   - Test email delivery

3. **Launch Campaign:**
   - Start with small test group
   - Monitor metrics
   - Optimize based on results

4. **Iterate:**
   - A/B test subject lines
   - Optimize send times
   - Refine messaging

---

**Campaign Version:** 1.0  
**Last Updated:** 2024-01-01  
**Status:** Ready for deployment



