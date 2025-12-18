# PDF Data Sources - Complete Breakdown

## 📊 Data Flow: Form → PDF

### Step 1: Form Submission Data
**Source:** `components/QuestionnaireForm.tsx` → `handleSubmit()`

**Data Collected:**
```typescript
{
  // From form questions:
  q1: "Business Name" (text input)
  q2: "Website or social link" (text input, optional)
  q3: "What are your goals?" (checkbox array)
  q4: "Biggest challenges?" (checkbox array)
  q5: "Primary offer" (checkbox array)
  sector: "professional-services" (from question id="sector")
  q21: "Budget" (radio)
  q22: "Timeline" (radio)
  q23: "Contact email" (text input)
  q24: "Phone" (text input, optional)
  
  // Defaults (not collected in form):
  firstName: "Client" (default)
  lastName: "User" (default)
  annualRevenue: "0-100k" (default)
  employeeCount: "1-5" (default)
  yearsInBusiness: "0-2" (default)
  currentDigitalMaturity: "basic" (default)
  isDecisionMaker: true (default)
  agreeToContact: true (default)
  subscribeToNewsletter: false (default)
}
```

### Step 2: API Route Transformation
**File:** `app/api/questionnaire/submit/route.ts`

**Transformation:**
```typescript
// Form data → API format
const apiPayload = {
  firstName: formData.firstName || "Client",           // DEFAULT
  lastName: formData.lastName || "User",               // DEFAULT
  businessName: formData.q1 || "",                     // FROM FORM (q1)
  businessEmail: formData.q23 || "",                   // FROM FORM (q23)
  businessPhone: formData.q24 || "0000000000",        // FROM FORM (q24)
  sector: mapSectorToApiFormat(formData.sector),       // FROM FORM (sector) → mapped
  annualRevenue: formData.annualRevenue || "0-100k",   // DEFAULT
  employeeCount: formData.employeeCount || "1-5",      // DEFAULT
  yearsInBusiness: formData.yearsInBusiness || "0-2",  // DEFAULT
  selectedPainPoints: mapChallengesToPainPoints(formData.q4), // FROM FORM (q4) → mapped
  currentDigitalMaturity: formData.currentDigitalMaturity || "basic", // DEFAULT
  primaryGoal: mapGoalToApiFormat(formData.q3),        // FROM FORM (q3) → mapped
  budget: mapBudgetToApiFormat(formData.q21),          // FROM FORM (q21) → mapped
  timelineToImplement: mapTimelineToApiFormat(formData.q22), // FROM FORM (q22) → mapped
  isDecisionMaker: formData.isDecisionMaker ?? true,   // DEFAULT
  agreeToContact: formData.agreeToContact ?? true,    // DEFAULT
  subscribeToNewsletter: formData.subscribeToNewsletter ?? false, // DEFAULT
};
```

### Step 3: Report Data Generation
**File:** `app/api/questionnaire/submit/route.ts:64-70`

**Data Sources:**
```typescript
const reportData: ReportData = {
  // FROM FORM DATA:
  clientName: formData.firstName || "Client",          // DEFAULT (not collected)
  businessName: formData.businessName || "Business",   // FROM FORM (q1)
  sector: formatSectorName(formData.sector),           // FROM FORM (sector) → formatted
  
  // FROM SECTOR MAPPING:
  topChallenges: challengeDetails,                     // FROM sectorChallengeMap → CHALLENGE_LIBRARY
  
  // GENERATED:
  generatedDate: new Date().toISOString().slice(0, 10), // CURRENT DATE
};
```

### Step 4: Sector → Challenge Mapping
**File:** `lib/utils/sector-mapping.ts` → `getTopChallengesForSector()`

**Data Source:** `lib/utils/sectorMapping.ts`

**Mapping Table:**
```typescript
sectorChallengeMap: {
  "healthcare": [3, 5, 6],
  "manufacturing": [1, 6, 4],
  "mining": [3, 5, 9],
  "agriculture": [1, 8, 2],
  "retail": [7, 4, 1],
  "hospitality": [7, 6, 2],
  "professional-services": [2, 4, 10],
  "construction": [1, 2, 3],
  "other": [4, 1, 10],
}
```

**Example:**
- Form sends: `sector: "professional-services"`
- Mapping returns: `[2, 4, 10]` (challenge IDs)

### Step 5: Challenge Details Lookup
**File:** `lib/utils/pain-point-mapping.ts` → `getChallengeDetails()`

**Data Source:** `lib/utils/pain-point-mapping.ts` → `CHALLENGE_LIBRARY`

**Challenge Library:**
```typescript
CHALLENGE_LIBRARY: {
  "1": { number: 1, title: "Reduce Operational Costs", sections: [...], roiTimeline: "...", projectCostRange: "..." },
  "2": { number: 2, title: "Improve Revenue & Conversions", sections: [...], roiTimeline: "...", projectCostRange: "..." },
  "3": { number: 3, title: "Scaling Service Delivery", sections: [...], roiTimeline: "...", projectCostRange: "..." },
  // ... up to "10"
}
```

**Example:**
- Challenge IDs: `[2, 4, 10]`
- Lookup returns:
  - Challenge 2: "Improve Revenue & Conversions"
  - Challenge 4: "Modernise Digital Experience"
  - Challenge 10: "Team Capability & Culture"

### Step 6: HTML Template Generation
**File:** `lib/pdf/generateClientReport.ts` → `generateHtmlTemplate()`

**Data Sources:**
1. **Template File:** `lib/pdf/templates/reportTemplate.html` (static HTML)
2. **Report Data:** `reportData` object (dynamic data)

**Placeholders Replaced:**
```html
{{CLIENT_NAME}}        → reportData.clientName (FROM FORM: firstName or "Client")
{{BUSINESS_NAME}}      → reportData.businessName (FROM FORM: q1)
{{SECTOR}}             → reportData.sector (FROM FORM: sector → formatted)
{{GENERATED_DATE}}     → reportData.generatedDate (CURRENT DATE)
{{CHALLENGES_HTML}}    → renderChallengesSections(reportData.topChallenges)
                         (FROM: sectorChallengeMap → CHALLENGE_LIBRARY)
{{RWS_LOGO_URL}}       → ${baseUrl}/images/rws-logo-transparent.png
{{AVOB_BADGE_URL}}     → ${baseUrl}/images/avob-logo-transparent.png
{{AVOB_LOGO_URL}}      → ${baseUrl}/images/avob-logo-transparent.png
```

### Step 7: Challenge Sections Rendering
**File:** `lib/pdf/generateClientReport.ts` → `renderChallengesSections()`

**Data Source:** `reportData.topChallenges` array

**Each Challenge Contains:**
```typescript
{
  number: 2,                                    // FROM CHALLENGE_LIBRARY
  title: "Improve Revenue & Conversions",       // FROM CHALLENGE_LIBRARY
  sections: [                                    // FROM CHALLENGE_LIBRARY
    "Your current digital presence may not be converting...",
    "Key journeys & calls-to-action may be unclear...",
    "You may not be fully leveraging data..."
  ],
  roiTimeline: "6–12 months",                   // FROM CHALLENGE_LIBRARY
  projectCostRange: "$15k–$40k (depending on...)" // FROM CHALLENGE_LIBRARY
}
```

---

## 🗂️ Complete Data Bucket Breakdown

### **Bucket 1: Form Input Data** (User-provided)
**Source:** `components/QuestionnaireForm.tsx`

| Field | Source Question | Required |
|-------|----------------|----------|
| `businessName` | q1: "Business name" | ✅ Yes |
| `sector` | sector: "Which sector best fits your business?" | ✅ Yes |
| `businessEmail` | q23: "Contact email" | ✅ Yes |
| `businessPhone` | q24: "Phone" | ❌ Optional |
| `q3` (goals) | q3: "What are your goals?" | ✅ Yes |
| `q4` (challenges) | q4: "Biggest challenges?" | ✅ Yes |
| `q5` (offers) | q5: "Primary offer" | ✅ Yes |
| `q21` (budget) | q21: Budget selection | ✅ Yes |
| `q22` (timeline) | q22: Timeline selection | ✅ Yes |

**Note:** `firstName` and `lastName` are NOT collected - they default to "Client" and "User"

### **Bucket 2: Sector Mapping** (Static Configuration)
**Source:** `lib/utils/sectorMapping.ts`

Maps sector → challenge IDs:
- `"professional-services"` → `[2, 4, 10]`
- `"healthcare"` → `[3, 5, 6]`
- `"retail"` → `[7, 4, 1]`
- etc.

### **Bucket 3: Challenge Library** (Static Content)
**Source:** `lib/utils/pain-point-mapping.ts` → `CHALLENGE_LIBRARY`

Contains 10 predefined challenges (IDs 1-10) with:
- Title
- Sections (bullet points)
- ROI timeline
- Project cost range

### **Bucket 4: HTML Template** (Static Structure)
**Source:** `lib/pdf/templates/reportTemplate.html`

Static HTML structure with placeholders for dynamic data.

### **Bucket 5: Generated Data** (Runtime)
- `generatedDate`: Current date (YYYY-MM-DD)
- `clientName`: From form or default "Client"
- Formatted sector name

---

## 🔍 Key Finding: What's Actually Used in PDF

### **Used in PDF:**
1. ✅ `businessName` (from q1)
2. ✅ `clientName` (defaults to "Client" - NOT collected from form!)
3. ✅ `sector` (from sector question, formatted)
4. ✅ `topChallenges` (from sectorChallengeMap → CHALLENGE_LIBRARY)
5. ✅ `generatedDate` (current date)

### **NOT Used in PDF:**
- ❌ `firstName` / `lastName` (not collected, defaults used)
- ❌ `businessEmail` (used for email, not in PDF)
- ❌ `businessPhone` (not in PDF)
- ❌ `q3` goals (not in PDF)
- ❌ `q4` challenges (not in PDF - uses sector mapping instead!)
- ❌ `q5` offers (not in PDF)
- ❌ `q21` budget (not in PDF)
- ❌ `q22` timeline (not in PDF)
- ❌ `selectedPainPoints` (not in PDF - uses sector mapping instead!)

---

## ✅ UPDATED: PDF Now Uses User-Selected Challenges

**The PDF NOW uses the user's selected challenges!**

**Updated Flow:**
1. User selects challenges in q4 → stored as `selectedPainPoints`
2. **PDF generation NOW uses:**
   - `selectedPainPoints` → `painPointToChallengeMap` → challenge IDs → CHALLENGE_LIBRARY
3. **Fallback:** If no pain points selected, uses sector mapping

**Result:**
- ✅ PDF shows personalized challenges based on user selections
- ✅ Each business gets unique PDF content based on their actual challenges
- ✅ Falls back to sector-based challenges if user didn't select any

---

## 📊 Updated Data Flow

### **Primary Path (User Selections):**
```
User selects challenges (q4)
  → selectedPainPoints: ["high-operating-costs", "digital-transformation", "cybersecurity"]
  → painPointToChallengeMap
  → challenge IDs: [1, 4, 9]
  → CHALLENGE_LIBRARY
  → PDF content (personalized)
```

### **Fallback Path (Sector-Based):**
```
No user selections
  → sector: "professional-services"
  → sectorChallengeMap[sector]
  → challenge IDs: [2, 4, 10]
  → CHALLENGE_LIBRARY
  → PDF content (generic for sector)
```

---

## 🗺️ Pain Point → Challenge Mapping

**File:** `lib/utils/pain-point-to-challenge.ts`

```typescript
painPointToChallengeMap: {
  "high-operating-costs": 1,        // → "Reduce Operational Costs"
  "cash-flow-strain": 2,            // → "Improve Revenue & Conversions"
  "regulatory-compliance": 9,       // → "Risk, Compliance & Resilience"
  "digital-transformation": 4,      // → "Modernise Digital Experience"
  "cybersecurity": 9,               // → "Risk, Compliance & Resilience"
  "labour-shortages": 3,            // → "Scaling Service Delivery"
  "reduced-demand": 7,              // → "Brand & Market Positioning"
  "market-access": 8,               // → "Innovation & New Service Development"
  "connectivity": 8,                // → "Innovation & New Service Development"
  "lack-of-leadership": 10,         // → "Team Capability & Culture"
}
```

---

## ✅ What's Now Used in PDF

### **Used in PDF:**
1. ✅ `businessName` (from q1)
2. ✅ `clientName` (defaults to "Client")
3. ✅ `sector` (from sector question, formatted)
4. ✅ `topChallenges` (from **user's selectedPainPoints** → painPointToChallengeMap → CHALLENGE_LIBRARY)
5. ✅ `generatedDate` (current date)

### **Fallback:**
- If `selectedPainPoints` is empty → uses sector-based mapping
