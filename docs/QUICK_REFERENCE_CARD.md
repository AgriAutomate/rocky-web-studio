# Rocky Web Studio: 8-Week Quick Reference
AI-First Case Study Development

## PLATFORMS AT A GLANCE
```
┌──────────────────┬─────────────────────┬────────────┐
│ Platform         │ When to Use         │ Cost       │
├──────────────────┼─────────────────────┼────────────┤
│ CURSOR IDE       │ Weeks 1-6: Coding   │ $20/mo     │
│ (Primary)        │ - Code edits        │ (Pro)      │
│                  │ - Git-aware diffs   │            │
├──────────────────┼─────────────────────┼────────────┤
│ GOOGLE           │ Week 7-8: Testing   │ FREE       │
│ ANTIGRAVITY      │ - Multi-browser     │ (beta)     │
│ (Optional)       │ - Parallel agents   │            │
├──────────────────┼─────────────────────┼────────────┤
│ NEXT.JS + SANITY │ All weeks: Stack    │ FREE       │
│ (Required)       │ - Framework         │ + $25 API  │
└──────────────────┴─────────────────────┴────────────┘
```

## 8-WEEK TIMELINE COMPRESSED
| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Accessibility audit & fixes | WCAG 2.1 AA compliant |
| 2 | Chatbot API + UI | Live chatbot |
| 3 | Sanity CMS schema | Studio working |
| 4 | Content migration | 10+ items published |
| 5 | Pro bono project | Real client work |
| 6 | Pro bono completion | Testimonial |
| 7 | Government registration | VendorPanel ready |
| 8 | Tender submission | 1-2 tenders submitted |

## 3 CASE STUDIES YOU'RE BUILDING

### 1. ACCESSIBILITY COMPLIANCE
```
Problem: 6 axe violations on rockywebstudio.com.au
Solution: Systematic WCAG 2.1 AA remediation
Results: 0 violations, Lighthouse 98/100
Timeline: Week 1-2 (14 days)
Value: Government WCAG expertise proven
```

### 2. AI CHATBOT
```
Problem: Manual inquiries taking 2-4 hours/day
Solution: Claude 3.5 chatbot with Next.js + React
Results: 65% self-serve, 2.5 hrs/day saved
Timeline: Week 2-3 (21 days)
Value: AI integration capability proven
```

### 3. HEADLESS CMS
```
Problem: Content updates 2-4 hours per page
Solution: Sanity.io CMS + Next.js + GROQ
Results: 90% time reduction (10-15 min updates)
Timeline: Week 3-4 (28 days)
Value: Enterprise CMS expertise proven
```

## CURSOR IDE COMMANDS
```
┌──────────────────┬──────────────────────────┐
│ Task             │ Command                  │
├──────────────────┼──────────────────────────┤
│ Chat with AI     │ Ctrl+K / Cmd+K          │
│ Inline prompt    │ Select → Right-click    │
│ Review diff      │ Cmd+G / Ctrl+G          │
│ Accept changes   │ Cmd+Shift+A             │
│ Reference file   │ @ in chat               │
└──────────────────┴──────────────────────────┘
```

## BEST CURSOR PROMPTS TO COPY

### Accessibility Fix
```
"Fix this accessibility violation: [describe issue]
- Current problem: [WCAG criterion]
- Keep existing functionality
- Maintain visual design
- Add ARIA/semantic HTML as needed"
```

### API Route Creation
```
"Create Next.js API route for [feature]:
- Accepts POST with [input structure]
- Calls [API/function]
- Streams response for real-time UX
- Includes rate limiting (10 req/min)
- Type everything with TypeScript
- Add proper error handling"
```

### Component Building
```
"Create React component that:
- Shows [content/interface]
- Handles loading/error states
- Is WCAG 2.1 AA accessible
- Uses TailwindCSS styling
- Includes TypeScript types
- Works on mobile/desktop"
```

### GROQ Query
```
"Write GROQ query to fetch:
- [what]: [resource type]
- [filter]: [criteria]
- [order]: [sort order]
- Use defineQuery() from next-sanity
- Return TypeScript-typed result"
```

## QUALITY GATES (Before Each Commit)
```
✅ TypeScript    npm run type-check        (0 errors)
✅ Accessibility npx axe rockywebstudio    (0 violations)
✅ Linting       npm run lint              (0 errors)
✅ Keyboard      Tab/Enter/Escape test     (all work)
✅ NVDA          Screen reader test        (readable)
✅ Git Diff      Review changes            (makes sense)
✅ Commit Msg    Descriptive message       (explains why)
```

## COMMON PITFALLS & PREVENTION
| Pitfall | How to Prevent |
|---------|----------------|
| Forgetting accessibility | Use .cursorrules; run axe before EVERY commit |
| Cursor lacks context | Write specific prompts; include code snippets |
| API key exposed | Use .env.local; add to .gitignore |
| Not reviewing diffs | ALWAYS review before accepting |
| Scope creep | Stick to 3 case studies only |
| Case study at end | Write 100 words daily; capture metrics weekly |

## WEEKLY CHECKLIST TEMPLATE
```
Week [X] Completion Checklist
════════════════════════════

Deliverables:
☐ Code features completed & working
☐ Accessibility audit run (0 violations)
☐ TypeScript type-checking passed
☐ Manual testing completed
☐ Git commits pushed

Documentation:
☐ Case study section written (100-200 words)
☐ Before/after metrics captured
☐ Screenshots taken
☐ Code samples documented

Quality:
☐ Cursor code reviewed
☐ Git diffs reviewed
☐ Tests passing
☐ No technical debt

Next Week Prep:
☐ Next tasks identified
☐ Blockers documented
☐ Cursor config updated
☐ Resources bookmarked
```

## IF YOU GET STUCK
- **"My Cursor prompt didn't work"**
  → Break into smaller prompts. 1 specific change at a time.

- **"I don't understand Cursor's code"**
  → Ask: "Explain this code line-by-line" or revert and retry.

- **"WCAG 2.1 AA is confusing"**
  → Reference: https://www.w3.org/WAI/WCAG21/quickref/

- **"Sanity queries not working"**
  → Test in Sanity Vision tool first, then debug.

- **"Claude API too expensive"**
  → Use GPT-4 mini (cheaper) or Gemini.

- **"Behind schedule"**
  → Cut scope: skip pro bono, use existing testimonial.

## SUCCESS LOOKS LIKE (Week 8)
```
✅ rockywebstudio.com.au
   - WCAG 2.1 AA compliant (0 violations)
   - Chatbot live & responding
   - CMS powering case studies

✅ 3 Case Studies Published
   1. Accessibility: "Achieving WCAG 2.1 AA"
   2. Chatbot: "AI-Powered Lead Qualification"
   3. CMS: "Modern CMS Implementation"
   
   Each with:
   - 1,200+ word narrative
   - Before/after metrics
   - Architecture diagram
   - Client testimonial
   - Professional PDF

✅ Government Ready
   - VendorPanel registered
   - QTenders registered
   - Capability statement written
   - 1-2 tenders submitted
```

## RESOURCE LINKS

### Accessibility
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM: https://webaim.org/
- Axe DevTools: https://www.deque.com/axe/devtools/

### Cursor IDE
- Docs: https://cursor.com/docs

### Claude API
- Docs: https://docs.anthropic.com/
- Pricing: https://www.anthropic.com/pricing

### Sanity.io
- Docs: https://www.sanity.io/docs
- GROQ: https://www.sanity.io/docs/groq

### Next.js
- Docs: https://nextjs.org/docs
- Vercel: https://vercel.com

### Government Procurement
- VendorPanel: https://www.vendorpanel.qld.gov.au/
- QTenders: https://www.qtenders.com.au/

## ONE-PAGE ACTION PLAN

**TODAY (Dec 25):**
- [ ] Read README.md
- [ ] Install Cursor IDE
- [ ] Copy .cursorrules to project

**TOMORROW (Dec 26):**
- [ ] Create project structure
- [ ] Setup Git + .gitignore
- [ ] Run accessibility audit (baseline)

**WEEK 1:**
- [ ] Fix accessibility violations
- [ ] Complete case study #1

**WEEK 2:**
- [ ] Implement chatbot API + UI
- [ ] Complete case study #2

**WEEK 3-4:**
- [ ] Build Sanity CMS + GROQ queries
- [ ] Complete case study #3

**WEEK 5-6:**
- [ ] Execute pro bono project
- [ ] Publish 4th case study

**WEEK 7-8:**
- [ ] Register on government platforms
- [ ] Submit tenders

---

Print this card. Keep visible. Reference daily.

Last updated: December 25, 2025
Status: READY FOR EXECUTION

