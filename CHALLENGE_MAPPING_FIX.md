# ✅ Challenge Mapping & Ordering Fix

## 🐛 Issues Fixed

### Issue 1: Challenges 5 and 6 Missing
**Root Cause:** Incorrect mapping in `painPointToChallengeMap`
- `"cybersecurity"` was mapped to challenge 9 (should be 5)
- `"labour-shortages"` was mapped to challenge 3 (should be 6)
- `"regulatory-compliance"` was mapped to challenge 9 (should be 3)

### Issue 2: Challenges Not in Numerical Order
**Root Cause:** `getChallengeDetails()` returned challenges in the order they were passed, not sorted numerically.

---

## ✅ Fixes Applied

### 1. Fixed Challenge Mapping

**File:** `lib/utils/pain-point-to-challenge.ts`

**Before:**
```typescript
export const painPointToChallengeMap: Record<PainPoint, number> = {
  "high-operating-costs": 1,
  "cash-flow-strain": 2,
  "regulatory-compliance": 9,       // ❌ Wrong - should be 3
  "digital-transformation": 4,
  "cybersecurity": 9,               // ❌ Wrong - should be 5
  "labour-shortages": 3,            // ❌ Wrong - should be 6
  "reduced-demand": 7,
  "market-access": 8,
  "connectivity": 8,                // ❌ Wrong - should be 9
  "lack-of-leadership": 10,
};
```

**After:**
```typescript
export const painPointToChallengeMap: Record<PainPoint, number> = {
  "high-operating-costs": 1,        // → Challenge 1: "Reduce Operational Costs"
  "cash-flow-strain": 2,            // → Challenge 2: "Improve Revenue & Conversions"
  "regulatory-compliance": 3,      // ✅ Fixed - Challenge 3: "Complex Regulatory & Compliance Burdens"
  "digital-transformation": 4,     // → Challenge 4: "Modernise Digital Experience"
  "cybersecurity": 5,               // ✅ Fixed - Challenge 5: "Cybersecurity Threats"
  "labour-shortages": 6,           // ✅ Fixed - Challenge 6: "Labour Shortages & Rising Wage Costs"
  "reduced-demand": 7,             // → Challenge 7: "Brand & Market Positioning"
  "market-access": 8,              // → Challenge 8: "Innovation & New Service Development"
  "connectivity": 9,               // ✅ Fixed - Challenge 9: "Digital Connectivity Limitations"
  "lack-of-leadership": 10,        // → Challenge 10: "Team Capability & Culture"
};
```

### 2. Added Numerical Sorting

**File:** `lib/data/challenges/index.ts`

**Before:**
```typescript
export function getChallengeDetails(ids: number[]): ChallengeDetail[] {
  // ... mapping logic ...
  return details; // ❌ Not sorted
}
```

**After:**
```typescript
export function getChallengeDetails(ids: number[]): ChallengeDetail[] {
  // ... mapping logic ...
  .filter((c): c is ChallengeDetail => Boolean(c))
  .sort((a, b) => a.number - b.number); // ✅ Sort numerically by challenge number

  return details;
}
```

---

## 📊 Correct Challenge Mapping

| Pain Point | Challenge ID | Challenge Title |
|------------|--------------|------------------|
| `high-operating-costs` | 1 | Reduce Operational Costs |
| `cash-flow-strain` | 2 | Improve Revenue & Conversions |
| `regulatory-compliance` | 3 | Complex Regulatory & Compliance Burdens |
| `digital-transformation` | 4 | Modernise Digital Experience |
| `cybersecurity` | 5 | Cybersecurity Threats |
| `labour-shortages` | 6 | Labour Shortages & Rising Wage Costs |
| `reduced-demand` | 7 | Brand & Market Positioning |
| `market-access` | 8 | Innovation & New Service Development |
| `connectivity` | 9 | Digital Connectivity Limitations |
| `lack-of-leadership` | 10 | Team Capability & Culture |

---

## ✅ Expected Results

### Before Fix:
- Challenges displayed: 10, 8, 7, 3, 9, 4, 1, 2 (wrong order)
- Missing: Challenges 5 and 6

### After Fix:
- Challenges displayed: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 (numerical order)
- All challenges included when selected

---

## 🧪 Testing

1. **Select all challenges** in the questionnaire form
2. **Submit form**
3. **Verify PDF/Email shows:**
   - ✅ All 10 challenges (1-10)
   - ✅ In numerical order (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
   - ✅ Challenge 5 (Cybersecurity Threats) appears
   - ✅ Challenge 6 (Labour Shortages) appears

---

**Status:** ✅ **FIXED - Challenges now display in numerical order with all 10 challenges included**
