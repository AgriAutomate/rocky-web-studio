# Duplicate Detection Workflow - Quick Reference

## 🎯 Workflow Summary

**Name:** Duplicate Lead Detector & Merger

**Trigger:** Webhook from `/api/service/lead-submit` (with `leadId`)

**Purpose:** Automatically detect and merge duplicate leads to maintain data quality

---

## 🔍 Detection Algorithm

### Step 1: Exact Matches
- **Query:** Phone + Email match
- **Score:** 100%
- **Action:** Manual review required

### Step 2: Likely Duplicates
- **Phone match only:** 85% score
- **Email match only:** 85% score
- **Name similarity + Phone:** 0-100% (based on similarity)
- **Action:**
  - >90%: Auto-merge
  - 70-90%: Manual review
  - <70%: No action

---

## 📊 Match Scoring

| Match Type | Score | Action |
|------------|-------|--------|
| **Phone + Email** | 100% | Manual review |
| **Phone only** | 85% | Auto-merge if >90% |
| **Email only** | 85% | Auto-merge if >90% |
| **Name similarity + Phone** | 0-100% | Based on similarity |

---

## 🔄 Merge Process

**Data Consolidated:**
- `engagement_count` - Summed
- `engagement_score` - Highest kept
- `last_engagement_date` - Most recent
- `internal_notes` - Concatenated
- `qualification_status` - Best kept (hot > warm > cold)

**Duplicate Record:**
- `duplicate_of` - Set to primary ID
- `is_primary` - Set to false
- `status` - Set to "merged"
- `merge_date` - Timestamp
- `merge_notes` - Reason for merge

---

## 📝 Database Fields Added

| Field | Type | Purpose |
|-------|------|---------|
| `duplicate_of` | UUID | References primary record |
| `merge_date` | TIMESTAMP | When merged |
| `merge_notes` | TEXT | Why merged |
| `duplicate_score` | INTEGER | Similarity score (0-100) |
| `is_primary` | BOOLEAN | Primary record flag |

---

## 🔔 Slack Notifications

**Exact Match:**
```
⚠️ Exact Duplicate Detected
Customer: [name]
Match: 100% (exact)
Action: Manual approval required
```

**Auto-Merged:**
```
✓ Auto-Merged Duplicate
Merged [new_id] into [primary_id]
Reason: [reasons] (Score: [score]%)
```

**Manual Review:**
```
🔍 Possible Duplicate - Review Needed
[new_name] might be duplicate of [existing_name]
Match Score: [score]%
Action: Manual review required
```

---

## 🚀 Setup Checklist

- [ ] Run database migration (`add_duplicate_detection_fields.sql`)
- [ ] Enable `pg_trgm` extension
- [ ] Create webhook in n8n
- [ ] Update `/api/service/lead-submit` to call webhook
- [ ] Configure Slack channel (#duplicates)
- [ ] Test exact match detection
- [ ] Test likely duplicate detection
- [ ] Verify auto-merge functionality
- [ ] Workflow activated

---

## 📚 Full Documentation

See `docs/n8n-duplicate-detection-workflow.md` for complete setup instructions.
