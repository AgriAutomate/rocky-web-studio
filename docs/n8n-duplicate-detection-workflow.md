# n8n Workflow: Duplicate Lead Detector & Merger

## 📋 Workflow Overview

**Workflow Name:** Duplicate Lead Detector & Merger

**Purpose:** Automatically detect duplicate leads using multiple matching algorithms, merge duplicates into primary records, and notify team of merge actions.

**Trigger:** Webhook from `/api/service/lead-submit` (with `leadId` in payload)

**Expected Behavior:**
- Detect exact matches (same phone + email)
- Detect likely duplicates (similar names, matching phone/email)
- Calculate similarity scores
- Auto-merge high-confidence duplicates (>90% score)
- Flag low-confidence duplicates for manual review
- Consolidate data from duplicates into primary record
- Notify team via Slack

---

## 🔍 Detection Algorithm

### Step 1: Exact Matches

**Query:**
```sql
SELECT 
  id, 
  first_name, 
  last_name, 
  email, 
  phone, 
  engagement_score,
  created_at,
  qualification_status
FROM service_leads
WHERE 
  phone = $1 
  AND email = $2
  AND is_primary = true
ORDER BY engagement_score DESC, created_at ASC
LIMIT 1
```

**Parameters:**
- `$1`: Incoming phone number
- `$2`: Incoming email address

**Action:**
- If found: Flag as "exact duplicate" (100% match)
- Require manual review before merge
- Send Slack alert for manual approval

---

### Step 2: Likely Duplicates (Secondary Check)

**Query:**
```sql
SELECT 
  id,
  first_name,
  last_name,
  email,
  phone,
  engagement_score,
  created_at,
  qualification_status,
  CASE
    WHEN phone = $1 AND email = $2 THEN 100
    WHEN phone = $1 AND email != $2 THEN 85
    WHEN email = $2 AND phone != $1 THEN 85
    WHEN SIMILARITY(first_name || ' ' || last_name, $3) > 0.8 AND phone = $1 THEN 
      ROUND(SIMILARITY(first_name || ' ' || last_name, $3) * 100)
    ELSE 0
  END as match_score
FROM service_leads
WHERE 
  (phone = $1 OR email = $2 OR 
   (SIMILARITY(first_name || ' ' || last_name, $3) > 0.8 AND phone = $1))
  AND is_primary = true
ORDER BY match_score DESC, engagement_score DESC
LIMIT 5
```

**Parameters:**
- `$1`: Incoming phone number
- `$2`: Incoming email address
- `$3`: Incoming full name (`first_name + ' ' + last_name`)

**Scoring:**
- Phone + Email match: 100% (exact duplicate)
- Phone match only: 85%
- Email match only: 85%
- Name similarity + Phone: 0-100% (based on similarity)

**Action:**
- If score > 90%: Auto-merge (if enabled)
- If score 70-90%: Flag for manual review
- If score < 70%: No action (likely different person)

---

### Step 3: Review & Auto-Merge

**Conditions for Auto-Merge:**
- Exact match (100% score) AND manual approval
- Likely match (>90% score) AND auto-merge enabled
- No conflicting data (e.g., different service types)

**Merge Actions:**

1. **Mark Records:**
   - Existing lead: Keep as primary (`is_primary = true`)
   - New lead: Mark as duplicate (`duplicate_of = primary_id`, `is_primary = false`)

2. **Consolidate Data:**
   ```sql
   UPDATE service_leads
   SET 
     -- Keep older created_at (preserve original lead date)
     created_at = LEAST(primary.created_at, duplicate.created_at),
     
     -- Sum engagement counts
     engagement_count = primary.engagement_count + duplicate.engagement_count,
     
     -- Keep higher engagement score
     engagement_score = GREATEST(primary.engagement_score, duplicate.engagement_score),
     
     -- Use most recent engagement date
     last_engagement_date = GREATEST(
       primary.last_engagement_date, 
       duplicate.last_engagement_date
     ),
     
     -- Merge internal notes
     internal_notes = COALESCE(primary.internal_notes, '') || E'\n--- Merged from ' || 
                      duplicate.id || ' on ' || NOW() || ' ---\n' || 
                      COALESCE(duplicate.internal_notes, ''),
     
     -- Keep better qualification status (hot > warm > cold)
     qualification_status = CASE
       WHEN primary.qualification_status = 'hot' OR duplicate.qualification_status = 'hot' THEN 'hot'
       WHEN primary.qualification_status = 'warm' OR duplicate.qualification_status = 'warm' THEN 'warm'
       ELSE primary.qualification_status
     END,
     
     -- Keep non-null values from either record
     service_type = COALESCE(primary.service_type, duplicate.service_type),
     location = COALESCE(primary.location, duplicate.location),
     description = COALESCE(primary.description, duplicate.description),
     
     -- Update UTM tracking (keep first non-null)
     utm_source = COALESCE(primary.utm_source, duplicate.utm_source),
     utm_campaign = COALESCE(primary.utm_campaign, duplicate.utm_campaign)
   WHERE id = primary_id
   ```

3. **Update Duplicate Record:**
   ```sql
   UPDATE service_leads
   SET 
     duplicate_of = $1,
     is_primary = false,
     merge_date = NOW(),
     merge_notes = $2,
     duplicate_score = $3,
     status = 'merged'
   WHERE id = $4
   ```

4. **Redirect Future Updates:**
   - All future API calls referencing duplicate ID should redirect to primary ID
   - Update any related records (bookings, etc.) to reference primary ID

---

### Step 4: Notification

**Exact Match Detected:**
```
⚠️ Duplicate detected: [first_name] [last_name] | Review manually
Phone: [phone] | Email: [email]
Match: 100% (exact)
Primary ID: [primary_id] | New ID: [new_id]
Action: Manual approval required
```

**Likely Match Detected:**
```
🔍 Possible duplicate: [new_name] might be duplicate of [existing_name]
Match Score: [score]%
Primary ID: [primary_id] | New ID: [new_id]
Action: [Auto-merged / Manual review required]
```

**Auto-Merged:**
```
✓ Merged [new_id] into [primary_id]
Customer: [first_name] [last_name]
Reason: [match_type] (Score: [score]%)
Consolidated: engagement_count, engagement_score, notes
```

**Manual Review Required:**
```
📋 Duplicate review needed: [new_name] vs [existing_name]
Match Score: [score]%
Primary ID: [primary_id] | New ID: [new_id]
Review: [workflow_link]
```

---

## 🗄️ Node Configuration

### Node 1: Webhook Trigger

**Type:** Webhook

**Configuration:**
- **Path:** `duplicate-detection`
- **Method:** POST
- **Expected Payload:**
  ```json
  {
    "leadId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
  ```

---

### Node 2: Query Exact Matches

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:** (See Step 1 above)
- **Parameters:**
  - `$1`: `{{ $json.phone }}`
  - `$2`: `{{ $json.email }}`

**Output:**
- Array of exact matches (should be 0 or 1)

---

### Node 3: Check for Exact Match

**Type:** IF Node

**Configuration:**
- **Condition:** `{{ $json.length > 0 }}`
- **True:** Route to exact match handler
- **False:** Continue to likely duplicates

---

### Node 4: Query Likely Duplicates

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:** (See Step 2 above)
- **Parameters:**
  - `$1`: `{{ $json.phone }}`
  - `$2`: `{{ $json.email }}`
  - `$3`: `{{ $json.firstName }} {{ $json.lastName }}`

**Output:**
- Array of potential matches with scores

---

### Node 5: Calculate Match Scores

**Type:** Code (Function)

**JavaScript:**
```javascript
const items = $input.all();
const incomingLead = items[0].json; // Original webhook data
const matches = items[1]?.json || []; // Likely duplicates

// Calculate detailed scores for each match
const scoredMatches = matches.map(match => {
  let score = 0;
  let reasons = [];

  // Phone match
  if (match.phone === incomingLead.phone) {
    score += 50;
    reasons.push('Phone match');
  }

  // Email match
  if (match.email === incomingLead.email) {
    score += 50;
    reasons.push('Email match');
  }

  // Name similarity (if not already 100%)
  if (score < 100 && match.first_name && match.last_name) {
    const matchName = `${match.first_name} ${match.last_name}`.toLowerCase();
    const incomingName = `${incomingLead.firstName} ${incomingLead.lastName}`.toLowerCase();
    
    // Simple similarity check
    const similarity = calculateSimilarity(matchName, incomingName);
    if (similarity > 0.8) {
      score = Math.max(score, Math.round(similarity * 100));
      reasons.push(`Name similarity: ${Math.round(similarity * 100)}%`);
    }
  }

  return {
    ...match,
    calculated_score: score,
    match_reasons: reasons.join(', ')
  };
});

// Sort by score descending
scoredMatches.sort((a, b) => b.calculated_score - a.calculated_score);

// Helper function for string similarity
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

return scoredMatches.map(match => ({ json: match }));
```

---

### Node 6: Route by Match Score

**Type:** IF Node

**Configuration:**
- **Condition 1:** `{{ $json.calculated_score >= 100 }}` → Exact match
- **Condition 2:** `{{ $json.calculated_score >= 90 }}` → Auto-merge
- **Condition 3:** `{{ $json.calculated_score >= 70 }}` → Manual review
- **Default:** No action (different person)

---

### Node 7: Auto-Merge (High Confidence)

**Type:** Code (Function)

**JavaScript:**
```javascript
const items = $input.all();
const primary = items[0].json; // Existing lead (primary)
const duplicate = items[1].json; // New lead (duplicate)
const matchScore = items[2]?.json?.calculated_score || 100;

// Prepare merge data
const mergeData = {
  primary_id: primary.id,
  duplicate_id: duplicate.id || duplicate.leadId,
  merge_notes: `Auto-merged: ${matchScore}% match. Reasons: ${items[2]?.json?.match_reasons || 'Exact match'}`,
  duplicate_score: matchScore
};

return [{ json: mergeData }];
```

---

### Node 8: Merge Records (Database Update)

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  -- Update primary record with consolidated data
  UPDATE service_leads primary
  SET 
    engagement_count = primary.engagement_count + COALESCE((
      SELECT engagement_count FROM service_leads WHERE id = $1
    ), 0),
    engagement_score = GREATEST(
      primary.engagement_score, 
      COALESCE((SELECT engagement_score FROM service_leads WHERE id = $1), 0)
    ),
    last_engagement_date = GREATEST(
      primary.last_engagement_date,
      (SELECT last_engagement_date FROM service_leads WHERE id = $1)
    ),
    internal_notes = COALESCE(primary.internal_notes, '') || E'\n--- Merged from ' || 
                    $1 || ' on ' || NOW() || ' ---\n' || 
                    COALESCE((SELECT internal_notes FROM service_leads WHERE id = $1), ''),
    qualification_status = CASE
      WHEN primary.qualification_status = 'hot' OR 
           (SELECT qualification_status FROM service_leads WHERE id = $1) = 'hot' THEN 'hot'
      WHEN primary.qualification_status = 'warm' OR 
           (SELECT qualification_status FROM service_leads WHERE id = $1) = 'warm' THEN 'warm'
      ELSE primary.qualification_status
    END
  WHERE primary.id = $2
  RETURNING id;

  -- Mark duplicate record
  UPDATE service_leads
  SET 
    duplicate_of = $2,
    is_primary = false,
    merge_date = NOW(),
    merge_notes = $3,
    duplicate_score = $4,
    status = 'merged'
  WHERE id = $1
  RETURNING id;
  ```

**Parameters:**
- `$1`: `{{ $json.duplicate_id }}`
- `$2`: `{{ $json.primary_id }}`
- `$3`: `{{ $json.merge_notes }}`
- `$4`: `{{ $json.duplicate_score }}`

---

### Node 9: Send Slack Notification

**Type:** Slack

**Configuration:**
- **Channel:** `#leads` or `#duplicates`
- **Message Template:**
  ```
  {{#if exact_match}}
  ⚠️ *Exact Duplicate Detected*
  Customer: {{ first_name }} {{ last_name }}
  Phone: {{ phone }} | Email: {{ email }}
  Match: 100% (exact)
  Primary ID: {{ primary_id }} | New ID: {{ new_id }}
  *Action:* Manual approval required
  {{else if auto_merged}}
  ✓ *Auto-Merged Duplicate*
  Merged {{ new_id }} into {{ primary_id }}
  Customer: {{ first_name }} {{ last_name }}
  Reason: {{ match_reasons }} (Score: {{ score }}%)
  {{else}}
  🔍 *Possible Duplicate - Review Needed*
  {{ new_name }} might be duplicate of {{ existing_name }}
  Match Score: {{ score }}%
  Primary ID: {{ primary_id }} | New ID: {{ new_id }}
  *Action:* Manual review required
  {{/if}}
  ```

---

## 🔧 Setup Instructions

### Prerequisites

1. **Database Schema:**
   - Run `add_duplicate_detection_fields.sql` migration
   - Enable `pg_trgm` extension for similarity matching

2. **Webhook Configuration:**
   - Update `/api/service/lead-submit` to call duplicate detection webhook **immediately** after lead creation
   - Pass `leadId` in payload
   - **Critical:** Webhook must be called synchronously or with minimal delay (< 1 minute)

3. **Slack Integration:**
   - Create `#duplicates` channel
   - Configure Slack bot token

4. **Nurture Workflow Integration:**
   - Update nurture workflow to check `is_primary = true` before sending emails
   - Exclude duplicate records from email campaigns

### Step-by-Step Setup

1. **Run Database Migration:**
   - Execute `add_duplicate_detection_fields.sql` in Supabase
   - Verify new columns exist

2. **Create Webhook Trigger:**
   - Set up webhook in n8n
   - Get webhook URL

3. **Update Lead Submit API:**
   - Add call to duplicate detection webhook after lead creation
   - Pass lead data in payload

4. **Configure Workflow Nodes:**
   - Set up Supabase credentials
   - Configure Slack integration
   - Test queries return expected results

5. **Test Workflow:**
   - Create test lead
   - Create duplicate lead
   - Verify detection and merge

6. **Activate Workflow:**
   - Toggle to "Active"
   - Monitor first few executions

---

## 🧪 Testing

### Test Case 1: Exact Duplicate

**Setup:**
1. Create lead: John Doe, john@example.com, +1234567890
2. Create duplicate: Same phone and email

**Expected:**
- Exact match detected (100% score)
- Slack alert sent
- Manual review required

### Test Case 2: Likely Duplicate (Auto-Merge)

**Setup:**
1. Create lead: Jane Smith, jane@example.com, +0987654321
2. Create duplicate: Same phone, different email (jane.smith@example.com)

**Expected:**
- Likely match detected (85% score)
- Auto-merged if score > 90%
- Slack notification sent

### Test Case 3: Name Similarity

**Setup:**
1. Create lead: "John Smith", john@example.com, +1111111111
2. Create duplicate: "Jon Smith", different email, same phone

**Expected:**
- Name similarity detected (>80%)
- Score calculated based on similarity
- Flagged for review or auto-merge

---

## ✅ Success Criteria

### Core Functionality
- [ ] Exact duplicates detected (100% match)
- [ ] Likely duplicates detected (>70% score)
- [ ] Auto-merge works for high-confidence matches
- [ ] Manual review flags for low-confidence matches
- [ ] Data consolidation correct
- [ ] Slack notifications sent
- [ ] Database updates applied correctly

### Success Metrics

**1. Detection Speed:**
- ✅ Duplicates caught within 1 minute of submission
- ✅ Webhook triggered immediately after lead creation
- ✅ No delays in duplicate detection workflow

**2. Email Prevention:**
- ✅ No duplicate nurture emails sent to merged leads
- ✅ Nurture workflow checks `is_primary = true` before sending
- ✅ Duplicate records excluded from email campaigns

**3. Database Integrity:**
- ✅ No orphaned records after merge
- ✅ All foreign key relationships maintained
- ✅ `duplicate_of` references valid primary records
- ✅ Related records (bookings, etc.) updated to reference primary ID

**4. Manual Review:**
- ✅ Edge cases flagged for manual review
- ✅ Low-confidence matches (70-90%) require approval
- ✅ Exact matches require manual confirmation before merge
- ✅ Review queue accessible via Slack notifications

---

## 📚 Related Documentation

- **Database Schema:** `database/schema/add_duplicate_detection_fields.sql`
- **Service Leads API:** `app/api/service/lead-submit/route.ts`
- **Lead Scoring:** `docs/n8n-lead-scoring-workflow.md`

---

## 🎯 Expected Results

After workflow is active:

✅ **Duplicate Detection:** Automatically detects exact and likely duplicates
✅ **Auto-Merge:** High-confidence duplicates merged automatically
✅ **Manual Review:** Low-confidence duplicates flagged for review
✅ **Data Consolidation:** Engagement data properly merged
✅ **Notifications:** Team alerted via Slack
✅ **Database Integrity:** Primary records maintained, duplicates archived
✅ **Fast Detection:** Duplicates caught within 1 minute of submission
✅ **Email Prevention:** No duplicate nurture emails sent to merged leads
✅ **Clean Database:** No orphaned records, all relationships maintained

The workflow ensures data quality by preventing duplicate leads and consolidating engagement data into primary records.

---

## 📊 Success Metrics Verification

### 1. Detection Speed (< 1 minute)

**How to Verify:**
```sql
-- Check time between lead creation and merge
SELECT 
  id,
  created_at,
  merge_date,
  EXTRACT(EPOCH FROM (merge_date - created_at)) / 60 as minutes_to_merge
FROM service_leads
WHERE merge_date IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:** All merges should occur within 1 minute of lead creation.

**Monitoring:**
- Set up alert if merge takes > 1 minute
- Log webhook trigger time vs merge time
- Track workflow execution duration in n8n

---

### 2. No Duplicate Nurture Emails

**How to Verify:**
```sql
-- Check for duplicate records in nurture campaigns
SELECT 
  id,
  email,
  is_primary,
  duplicate_of,
  nurture_stage_1_sent,
  nurture_stage_2_sent
FROM service_leads
WHERE 
  (nurture_stage_1_sent = true OR nurture_stage_2_sent = true)
  AND is_primary = false;
```

**Expected:** No duplicate records should have nurture emails sent.

**Prevention:**
- Update nurture workflow queries to include `WHERE is_primary = true`
- Add check in email sending nodes to skip if `is_primary = false`
- Log any attempts to send to duplicate records

**Example Query Update for Nurture Workflow:**
```sql
-- Before (incorrect):
SELECT * FROM service_leads WHERE qualification_status = 'warm' ...

-- After (correct):
SELECT * FROM service_leads 
WHERE qualification_status = 'warm' 
  AND is_primary = true  -- Only send to primary records
  ...
```

---

### 3. Database Integrity (No Orphaned Records)

**How to Verify:**
```sql
-- Check for orphaned duplicate references
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

**Expected:** No orphaned references (all `duplicate_of` values should reference existing primary records).

**Prevention:**
- Use foreign key constraint: `REFERENCES service_leads(id) ON DELETE SET NULL`
- Update related records (bookings) to reference primary ID during merge
- Add database triggers to maintain referential integrity

**Related Records Update:**
```sql
-- Update bookings to reference primary lead
UPDATE service_bookings
SET lead_id = $1  -- primary_id
WHERE lead_id = $2  -- duplicate_id;
```

---

### 4. Manual Review for Edge Cases

**How to Verify:**
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
  merge_notes
FROM service_leads
WHERE 
  duplicate_score BETWEEN 70 AND 90
  AND merge_date IS NULL
  AND duplicate_of IS NULL
ORDER BY duplicate_score DESC;
```

**Expected:** Low-confidence matches (70-90%) should remain unmerged until manual approval.

**Review Process:**
- Slack notifications include review link
- Manual review queue accessible via dashboard
- Approval workflow updates records after review

---

## 🔍 Monitoring Queries

### Daily Duplicate Detection Report

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE duplicate_of IS NOT NULL) as duplicates_detected,
  COUNT(*) FILTER (WHERE merge_date IS NOT NULL) as duplicates_merged,
  AVG(EXTRACT(EPOCH FROM (merge_date - created_at)) / 60) as avg_minutes_to_merge,
  MAX(EXTRACT(EPOCH FROM (merge_date - created_at)) / 60) as max_minutes_to_merge
FROM service_leads
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Duplicate Email Prevention Check

```sql
-- Find any duplicate records that received nurture emails (should be 0)
SELECT 
  sl.id,
  sl.email,
  sl.is_primary,
  sl.duplicate_of,
  sl.nurture_stage_1_sent,
  sl.nurture_stage_2_sent,
  sl.nurture_stage_3_sent,
  sl.nurture_stage_4_sent
FROM service_leads sl
WHERE 
  sl.is_primary = false
  AND (
    sl.nurture_stage_1_sent = true OR
    sl.nurture_stage_2_sent = true OR
    sl.nurture_stage_3_sent = true OR
    sl.nurture_stage_4_sent = true
  );
```

### Database Integrity Check

```sql
-- Comprehensive integrity check
SELECT 
  'Orphaned duplicate references' as check_type,
  COUNT(*) as issues_found
FROM service_leads sl
WHERE sl.duplicate_of IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM service_leads primary
    WHERE primary.id = sl.duplicate_of
  )

UNION ALL

SELECT 
  'Duplicate records marked as primary' as check_type,
  COUNT(*) as issues_found
FROM service_leads
WHERE duplicate_of IS NOT NULL
  AND is_primary = true

UNION ALL

SELECT 
  'Primary records with duplicate_of set' as check_type,
  COUNT(*) as issues_found
FROM service_leads
WHERE is_primary = true
  AND duplicate_of IS NOT NULL;
```
