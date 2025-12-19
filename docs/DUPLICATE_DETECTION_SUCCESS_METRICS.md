# Duplicate Detection - Success Metrics Verification

## 📊 Success Metrics

### 1. ✅ Duplicates Caught Within 1 Minute of Submission

**Requirement:** All duplicate leads must be detected and flagged within 1 minute of lead submission.

**Verification Query:**
```sql
-- Check time between lead creation and merge
SELECT 
  id,
  first_name,
  last_name,
  email,
  created_at,
  merge_date,
  EXTRACT(EPOCH FROM (merge_date - created_at)) / 60 as minutes_to_merge,
  CASE 
    WHEN EXTRACT(EPOCH FROM (merge_date - created_at)) / 60 <= 1 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM service_leads
WHERE merge_date IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;
```

**Expected Result:** All records should show `minutes_to_merge <= 1` and status `✅ PASS`.

**Implementation:**
- ✅ Duplicate detection webhook called **immediately** after lead creation in `/api/service/lead-submit`
- ✅ Webhook triggered synchronously (not queued)
- ✅ Workflow executes without delays

**Monitoring:**
- Set up alert if merge takes > 1 minute
- Track webhook trigger time vs merge time in logs
- Monitor n8n workflow execution duration

---

### 2. ✅ No Duplicate Nurture Emails Sent

**Requirement:** Duplicate records (where `is_primary = false`) must never receive nurture emails.

**Verification Query:**
```sql
-- Find any duplicate records that received nurture emails (should return 0 rows)
SELECT 
  id,
  email,
  first_name,
  last_name,
  is_primary,
  duplicate_of,
  nurture_stage_1_sent,
  nurture_stage_2_sent,
  nurture_stage_3_sent,
  nurture_stage_4_sent
FROM service_leads
WHERE 
  is_primary = false
  AND (
    nurture_stage_1_sent = true OR
    nurture_stage_2_sent = true OR
    nurture_stage_3_sent = true OR
    nurture_stage_4_sent = true
  );
```

**Expected Result:** Query should return **0 rows**. If any rows are returned, this indicates a failure.

**Prevention:**
- ✅ All nurture workflow queries include `WHERE is_primary = true`
- ✅ Email sending nodes check `is_primary` before sending
- ✅ Duplicate records excluded from all email campaigns

**Updated Nurture Queries:**
All nurture workflow queries now include:
```sql
WHERE ... AND is_primary = true  -- Only send to primary records
```

---

### 3. ✅ Database Stays Clean (No Orphaned Records)

**Requirement:** All database relationships must remain intact after merging. No orphaned records or broken references.

**Verification Queries:**

**A. Check for Orphaned Duplicate References:**
```sql
-- Should return 0 rows
SELECT 
  id,
  duplicate_of,
  is_primary
FROM service_leads
WHERE duplicate_of IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM service_leads primary
    WHERE primary.id = service_leads.duplicate_of
  );
```

**B. Check for Duplicate Records Marked as Primary:**
```sql
-- Should return 0 rows
SELECT 
  id,
  duplicate_of,
  is_primary
FROM service_leads
WHERE duplicate_of IS NOT NULL
  AND is_primary = true;
```

**C. Check for Primary Records with duplicate_of Set:**
```sql
-- Should return 0 rows
SELECT 
  id,
  is_primary,
  duplicate_of
FROM service_leads
WHERE is_primary = true
  AND duplicate_of IS NOT NULL;
```

**D. Check Related Records (Bookings):**
```sql
-- Verify bookings reference valid primary leads
SELECT 
  sb.id as booking_id,
  sb.lead_id,
  sl.id as lead_exists,
  sl.is_primary,
  sl.duplicate_of
FROM service_bookings sb
LEFT JOIN service_leads sl ON sl.id = sb.lead_id
WHERE sl.id IS NULL  -- Orphaned booking
   OR (sl.duplicate_of IS NOT NULL AND sl.is_primary = false);  -- Booking references duplicate
```

**Expected Result:** All queries should return **0 rows**.

**Prevention:**
- ✅ Foreign key constraint: `REFERENCES service_leads(id) ON DELETE SET NULL`
- ✅ Related records (bookings) updated to reference primary ID during merge
- ✅ Database triggers maintain referential integrity
- ✅ Merge process updates all related records

**Related Records Update (During Merge):**
```sql
-- Update bookings to reference primary lead
UPDATE service_bookings
SET lead_id = $1  -- primary_id
WHERE lead_id = $2;  -- duplicate_id
```

---

### 4. ✅ Manual Review for Edge Cases

**Requirement:** Low-confidence matches (70-90% score) and exact matches (100%) must require manual approval before merging.

**Verification Query:**
```sql
-- Check for records awaiting manual review
SELECT 
  id,
  first_name,
  last_name,
  email,
  phone,
  duplicate_score,
  merge_date,
  merge_notes,
  CASE 
    WHEN duplicate_score BETWEEN 70 AND 90 AND merge_date IS NULL THEN 'Awaiting Review'
    WHEN duplicate_score = 100 AND merge_date IS NULL THEN 'Exact Match - Awaiting Approval'
    WHEN duplicate_score >= 90 AND merge_date IS NOT NULL THEN 'Auto-Merged'
    ELSE 'Other'
  END as review_status
FROM service_leads
WHERE 
  (duplicate_score BETWEEN 70 AND 100)
  OR (duplicate_score IS NULL AND duplicate_of IS NULL)
ORDER BY duplicate_score DESC NULLS LAST;
```

**Expected Result:**
- Records with score 70-90% should have `merge_date IS NULL` (awaiting review)
- Records with score 100% should have `merge_date IS NULL` (awaiting approval)
- Only records with score > 90% should be auto-merged

**Review Process:**
- ✅ Slack notifications include review link for manual approval
- ✅ Manual review queue accessible via dashboard
- ✅ Approval workflow updates records after review
- ✅ Exact matches (100%) always require manual confirmation

---

## 📈 Daily Monitoring Dashboard

### Daily Duplicate Detection Report

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE duplicate_of IS NOT NULL) as duplicates_detected,
  COUNT(*) FILTER (WHERE merge_date IS NOT NULL) as duplicates_merged,
  COUNT(*) FILTER (WHERE duplicate_score BETWEEN 70 AND 90 AND merge_date IS NULL) as awaiting_review,
  AVG(EXTRACT(EPOCH FROM (merge_date - created_at)) / 60) as avg_minutes_to_merge,
  MAX(EXTRACT(EPOCH FROM (merge_date - created_at)) / 60) as max_minutes_to_merge,
  COUNT(*) FILTER (
    WHERE is_primary = false 
    AND (nurture_stage_1_sent = true OR nurture_stage_2_sent = true)
  ) as duplicate_emails_sent  -- Should always be 0
FROM service_leads
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Key Metrics:**
- `avg_minutes_to_merge` should be < 1 minute
- `max_minutes_to_merge` should be < 1 minute
- `duplicate_emails_sent` should always be 0

---

## 🚨 Alert Conditions

Set up alerts for the following conditions:

1. **Detection Delay:**
   - Alert if any merge takes > 1 minute
   - Alert if webhook trigger fails

2. **Duplicate Emails:**
   - Alert if any duplicate record receives nurture email
   - Alert if `is_primary = false` and nurture email sent

3. **Database Integrity:**
   - Alert if orphaned duplicate references found
   - Alert if bookings reference duplicate leads
   - Alert if primary records have `duplicate_of` set

4. **Review Queue:**
   - Alert if review queue > 10 records
   - Alert if exact matches (100%) are auto-merged without approval

---

## ✅ Success Criteria Checklist

- [ ] All duplicates detected within 1 minute of submission
- [ ] No duplicate records receive nurture emails
- [ ] No orphaned records in database
- [ ] All foreign key relationships intact
- [ ] Related records (bookings) updated to primary ID
- [ ] Manual review required for edge cases (70-90% score)
- [ ] Exact matches (100%) require manual approval
- [ ] Daily monitoring queries return expected results
- [ ] Alerts configured for all failure conditions

---

## 📚 Related Documentation

- **Workflow Documentation:** `docs/n8n-duplicate-detection-workflow.md`
- **Database Schema:** `database/schema/add_duplicate_detection_fields.sql`
- **Nurture Workflow:** `docs/n8n-nurture-workflow.md` (updated with `is_primary` checks)
- **API Route:** `app/api/service/lead-submit/route.ts` (includes duplicate detection webhook)

---

## 🎯 Expected Results

After implementation:

✅ **Fast Detection:** Duplicates caught within 1 minute of submission
✅ **Email Prevention:** No duplicate nurture emails sent
✅ **Database Integrity:** Clean database with no orphaned records
✅ **Manual Review:** Edge cases flagged for human review
✅ **Monitoring:** Daily reports track all success metrics
✅ **Alerts:** Automated alerts for any failures

The duplicate detection system ensures data quality while maintaining fast response times and preventing duplicate communications.
