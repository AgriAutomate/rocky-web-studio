# n8n Workflow: Auto-Schedule & Route Optimization

## 📋 Workflow Overview

**Workflow Name:** Auto-Schedule & Route Optimization

**Purpose:** Automatically assign technicians to bookings based on skills, availability, and optimal routing, preventing double-bookings and maximizing efficiency.

**Trigger:** New booking created with `urgency = 'today'` or `urgency = 'next_48h'`

**Expected Behavior:**
- Extract booking requirements
- Find eligible technicians
- Calculate optimal routing
- Assign best technician automatically
- Prevent double-bookings
- Send customer confirmation
- Sync with Google Calendar

---

## 🔄 Assignment Algorithm

### Step 1: Extract Booking Requirements

**Query Booking Details:**
```sql
SELECT 
  sb.id as booking_id,
  sb.lead_id,
  sb.scheduled_date,
  sb.time_window,
  sb.service_type,
  sb.description,
  sl.location as customer_location,
  sl.first_name,
  sl.last_name,
  sl.email,
  sl.phone,
  st.estimated_duration_minutes
FROM service_bookings sb
INNER JOIN service_leads sl ON sl.id = sb.lead_id
LEFT JOIN service_types st ON st.service_key = sb.service_type
WHERE sb.id = $1;
```

**Query Required Skills:**
```sql
SELECT 
  required_skill,
  minimum_level,
  certification_required,
  priority
FROM service_skill_requirements
WHERE service_type = $1
ORDER BY priority ASC;
```

**Output:**
- Service type
- Scheduled date & time window
- Customer location
- Estimated duration
- Required skills list

---

### Step 2: Find Eligible Technicians

**Query Eligible Technicians:**
```sql
WITH required_skills AS (
  SELECT required_skill, minimum_level, certification_required
  FROM service_skill_requirements
  WHERE service_type = $1
),
technicians_with_skills AS (
  SELECT DISTINCT ts.technician_id
  FROM technician_skills ts
  INNER JOIN required_skills rs ON rs.required_skill = ts.skill_name
  WHERE ts.certified = COALESCE(rs.certification_required, true)
    AND (
      (rs.minimum_level = 'junior' AND ts.skill_level IN ('junior', 'mid', 'senior', 'expert')) OR
      (rs.minimum_level = 'mid' AND ts.skill_level IN ('mid', 'senior', 'expert')) OR
      (rs.minimum_level = 'senior' AND ts.skill_level IN ('senior', 'expert')) OR
      (rs.minimum_level = 'expert' AND ts.skill_level = 'expert')
    )
  GROUP BY ts.technician_id
  HAVING COUNT(DISTINCT rs.required_skill) = (SELECT COUNT(*) FROM required_skills)
),
available_technicians AS (
  SELECT 
    ta.technician_id,
    ta.current_load_minutes,
    ta.max_capacity_minutes,
    ta.last_job_location,
    ta.home_base_location,
    ta.date,
    ta.start_time,
    ta.end_time
  FROM technician_availability ta
  INNER JOIN technicians_with_skills tws ON tws.technician_id = ta.technician_id
  WHERE ta.date = $2  -- scheduled_date
    AND ta.status = 'available'
    AND ta.current_load_minutes + $3 <= ta.max_capacity_minutes  -- estimated_duration
    AND (
      -- Check time window fits within availability
      (ta.start_time <= $4 AND ta.end_time >= $5)  -- time_window start/end
    )
)
SELECT * FROM available_technicians;
```

**Filter Criteria:**
- Has all required skills at adequate level
- Available on scheduled date
- Has capacity (current_load + estimated_duration <= max_capacity)
- Time window fits within availability
- Not double-booked (checked separately)

---

### Step 3: Calculate Routing & Score

**For Each Eligible Technician:**

**A. Get Last Job Location:**
```sql
SELECT 
  last_job_location,
  home_base_location
FROM technician_availability
WHERE technician_id = $1
  AND date = $2
LIMIT 1;
```

**B. Calculate Travel Time (Google Maps API):**
- **From:** `last_job_location` OR `home_base_location`
- **To:** `customer_location`
- **Time:** Requested appointment time
- **Mode:** Driving

**C. Calculate Total Time:**
```
Total Time = Travel Time + Estimated Duration + Buffer (15 minutes)
```

**D. Check Time Window Fit:**
- Verify: `appointment_time + total_time <= availability_end_time`
- Verify: `appointment_time >= availability_start_time`

**E. Score Technician:**
```javascript
// Lower score = better (less travel time)
const score = travelTimeMinutes + (currentLoadMinutes * 0.1); // Prefer less loaded techs
```

---

### Step 4: Prevent Double-Booking

**Check for Conflicts:**
```sql
SELECT COUNT(*) as conflict_count
FROM service_bookings sb
INNER JOIN technician_availability ta ON ta.technician_id = $1
WHERE sb.technician_id = $1
  AND sb.booking_status IN ('scheduled', 'assigned', 'en-route', 'in_progress')
  AND sb.scheduled_date = $2  -- scheduled_date
  AND (
    -- Check for time overlap
    (sb.time_window && $3) OR  -- time_window overlap
    (sb.scheduled_date = $2 AND sb.time_window IS NULL AND $3 IS NULL)
  )
  AND sb.id != $4;  -- current booking_id
```

**If Conflict Found:**
- Skip this technician
- Log conflict reason
- Continue to next technician

---

### Step 5: Assign Technician

**Select Best Technician:**
- Choose technician with lowest score (least travel time)
- If tie: Choose technician with lower current load

**Update Database:**
```sql
-- Update booking
UPDATE service_bookings
SET 
  technician_id = $1,
  technician_name = $2,
  booking_status = 'assigned',
  customer_notification_sent = NOW()
WHERE id = $3;

-- Update technician availability
UPDATE technician_availability
SET 
  current_load_minutes = current_load_minutes + $4,  -- estimated_duration
  last_job_location = $5,  -- customer_location
  status = CASE 
    WHEN current_load_minutes + $4 >= max_capacity_minutes THEN 'booked'
    ELSE 'available'
  END,
  updated_at = NOW()
WHERE technician_id = $1
  AND date = $6;  -- scheduled_date
```

**Add to Google Calendar:**
- Create calendar event for technician
- Include: Customer name, location, service type, time window
- Set reminders

---

### Step 6: Customer Confirmation

**Send SMS:**
- Message: "Your tech is [technician_name], arriving [scheduled_date] [time_window]"

**Send Email:**
- Subject: "Your technician is on the way - [scheduled_date]"
- Include: Technician name, vehicle details, directions

**Update Tracking:**
- Set `customer_notification_sent = NOW()`

---

## 🗄️ Node Configuration

### Node 1: Booking Created Webhook

**Type:** Webhook

**Configuration:**
- **Path:** `smart-booking-assignment`
- **Method:** POST
- **Expected Payload:**
  ```json
  {
    "bookingId": "uuid",
    "urgency": "today" | "next_48h"
  }
  ```

---

### Node 2: Extract Booking Requirements

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:** (See Step 1 above)
- **Parameters:**
  - `$1`: `{{ $json.bookingId }}`

---

### Node 3: Query Required Skills

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:** (See Step 1 - Required Skills)
- **Parameters:**
  - `$1`: `{{ $json.service_type }}`

---

### Node 4: Find Eligible Technicians

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:** (See Step 2 above)
- **Parameters:**
  - `$1`: `{{ $json.service_type }}`
  - `$2`: `{{ $json.scheduled_date }}`
  - `$3`: `{{ $json.estimated_duration_minutes }}`
  - `$4`: Time window start
  - `$5`: Time window end

---

### Node 5: Calculate Routing (Loop)

**Type:** Code (Function) - Process Each Technician

**JavaScript:**
```javascript
const items = $input.all();
const booking = items[0].json; // Booking details
const technicians = items[1]?.json || []; // Eligible technicians

const scoredTechnicians = await Promise.all(technicians.map(async (tech) => {
  // Get last job location
  const lastLocation = tech.last_job_location || tech.home_base_location;
  
  // Calculate travel time via Google Maps API
  let travelTime = 30; // Default fallback
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${encodeURIComponent(lastLocation)}&` +
      `destination=${encodeURIComponent(booking.customer_location)}&` +
      `key=${process.env.GOOGLE_MAPS_API_KEY}&` +
      `mode=driving&departure_time=${Math.floor(new Date(booking.scheduled_date).getTime() / 1000)}`
    );
    const data = await response.json();
    if (data.routes?.[0]?.legs?.[0]) {
      travelTime = Math.ceil(data.routes[0].legs[0].duration.value / 60); // Convert to minutes
    }
  } catch (error) {
    console.error('Google Maps API error:', error);
    // Use default travel time
  }
  
  // Calculate total time
  const totalTime = travelTime + booking.estimated_duration_minutes + 15; // Buffer
  
  // Calculate score (lower is better)
  const score = travelTime + (tech.current_load_minutes * 0.1);
  
  return {
    ...tech,
    travel_time_minutes: travelTime,
    total_time_minutes: totalTime,
    assignment_score: score
  };
}));

// Sort by score (best first)
scoredTechnicians.sort((a, b) => a.assignment_score - b.assignment_score);

return scoredTechnicians.map(tech => ({ json: tech }));
```

---

### Node 6: Check for Double-Booking

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:** (See Step 4 above)
- **Parameters:**
  - `$1`: `{{ $json.technician_id }}`
  - `$2`: `{{ $json.scheduled_date }}`
  - `$3`: `{{ $json.time_window }}`
  - `$4`: `{{ $json.booking_id }}`

---

### Node 7: Select Best Technician

**Type:** Code (Function)

**JavaScript:**
```javascript
const items = $input.all();
const technicians = items.map(item => item.json);

// Filter out technicians with conflicts
const available = technicians.filter(tech => 
  tech.conflict_count === 0 || tech.conflict_count === undefined
);

if (available.length === 0) {
  // No available technicians - queue for manual assignment
  return [{
    json: {
      assignment_status: 'failed',
      reason: 'No available technicians found',
      technicians_checked: technicians.length
    }
  }];
}

// Select best (lowest score)
const best = available[0];

return [{
  json: {
    assignment_status: 'success',
    technician_id: best.technician_id,
    technician_name: best.technician_name || best.technician_id,
    travel_time_minutes: best.travel_time_minutes,
    assignment_score: best.assignment_score
  }
}];
```

---

### Node 8: Assign Technician

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:** (See Step 5 above)
- **Parameters:**
  - `$1`: `{{ $json.technician_id }}`
  - `$2`: `{{ $json.technician_name }}`
  - `$3`: `{{ $json.booking_id }}`
  - `$4`: `{{ $json.estimated_duration_minutes }}`
  - `$5`: `{{ $json.customer_location }}`
  - `$6`: `{{ $json.scheduled_date }}`

---

### Node 9: Add to Google Calendar

**Type:** Google Calendar

**Configuration:**
- **Operation:** Create Event
- **Calendar:** Technician's calendar
- **Summary:** `[service_type] - [customer_name]`
- **Start:** `{{ $json.scheduled_date }}T{{ $json.time_window_start }}`
- **End:** `{{ $json.scheduled_date }}T{{ $json.time_window_end }}`
- **Location:** `{{ $json.customer_location }}`
- **Description:** Service details and customer contact info

---

### Node 10: Send Customer Confirmation

**Type:** Twilio (SMS) + Resend (Email)

**Configuration:**
- **SMS:** "Your tech is [name], arriving [date] [time]"
- **Email:** Confirmation template with technician details

---

### Node 11: Queue for Manual Assignment

**Type:** Supabase (PostgreSQL)

**Configuration:**
- **Operation:** Execute Query
- **Query:**
  ```sql
  INSERT INTO manual_assignments (
    booking_id,
    lead_id,
    assignment_reason,
    priority,
    attempted_auto_assign,
    auto_assign_failure_reason
  ) VALUES ($1, $2, $3, $4, true, $5)
  RETURNING id;
  ```

---

## 🔌 Integrations

### Google Maps API

**Purpose:** Calculate travel time for routing optimization

**Configuration:**
- **API Key:** From Google Cloud Console
- **Enable:** Directions API, Distance Matrix API
- **Usage:** Calculate route from last job to customer location

**Error Handling:**
- API failure: Use default travel time (30 minutes)
- Rate limit: Cache results, retry later

---

### Google Calendar

**Purpose:** Sync technician schedules

**Configuration:**
- **OAuth:** Google Calendar API credentials
- **Calendar ID:** Per technician
- **Permissions:** Read/Write calendar events

**Error Handling:**
- Sync failure: Email technician instead
- Log error for manual follow-up

---

## 📊 Success Metrics

### Average Assignment Time

**Goal:** < 2 minutes

**Query:**
```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (assigned_at - created_at)) / 60) as avg_assignment_minutes
FROM service_bookings
WHERE technician_id IS NOT NULL
  AND created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

### Auto-Assignment Rate

**Goal:** 95%+

**Query:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE technician_id IS NOT NULL) as auto_assigned,
  COUNT(*) as total_bookings,
  ROUND(
    (COUNT(*) FILTER (WHERE technician_id IS NOT NULL)::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as auto_assignment_rate
FROM service_bookings
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND urgency IN ('today', 'next_48h');
```

---

### Double-Booking Rate

**Goal:** 0%

**Query:**
```sql
SELECT 
  COUNT(*) as double_bookings
FROM (
  SELECT 
    technician_id,
    scheduled_date,
    COUNT(*) as booking_count
  FROM service_bookings
  WHERE booking_status IN ('scheduled', 'assigned', 'en-route', 'in_progress')
    AND technician_id IS NOT NULL
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY technician_id, scheduled_date, time_window
  HAVING COUNT(*) > 1
) conflicts;
```

---

### Customer Cancellation Rate (Tech-Related)

**Goal:** < 2%

**Query:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE cancellation_reason LIKE '%technician%' OR cancellation_reason LIKE '%tech%') as tech_cancellations,
  COUNT(*) as total_cancellations,
  ROUND(
    (COUNT(*) FILTER (WHERE cancellation_reason LIKE '%technician%' OR cancellation_reason LIKE '%tech%')::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as tech_cancellation_rate
FROM service_bookings
WHERE booking_status = 'cancelled'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

### Technician Utilization

**Goal:** 80%+ (4 hours/day out of 5)

**Query:**
```sql
SELECT 
  technician_id,
  AVG(current_load_minutes) as avg_daily_minutes,
  AVG(max_capacity_minutes) as avg_capacity_minutes,
  ROUND(
    (AVG(current_load_minutes)::DECIMAL / 
     NULLIF(AVG(max_capacity_minutes), 0)) * 100, 
    2
  ) as utilization_percent
FROM technician_availability
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  AND status IN ('available', 'booked')
GROUP BY technician_id
ORDER BY utilization_percent DESC;
```

---

## 🚨 Error Handling

### No Available Technicians

**Action:**
1. Insert into `manual_assignments` table
2. Send email alert to martin@rockywebstudio.com.au
3. Post Slack notification to #bookings
4. Log reason for failure

---

### Google Maps API Failure

**Action:**
1. Use default travel time (30 minutes)
2. Log error for review
3. Continue with assignment
4. Alert if multiple failures

---

### Google Calendar Sync Failure

**Action:**
1. Log error
2. Email technician directly
3. Continue with assignment
4. Alert for manual calendar update

---

### Customer SMS Failure

**Action:**
1. Log error
2. Send email instead
3. Continue with assignment
4. Alert if email also fails

---

## ✅ Success Criteria

- [ ] Average assignment time < 2 minutes
- [ ] Auto-assignment rate > 95%
- [ ] Double-booking rate = 0%
- [ ] Tech-related cancellations < 2%
- [ ] Technician utilization > 80%
- [ ] Google Maps integration working
- [ ] Google Calendar sync working
- [ ] Customer confirmations sent

---

## 📚 Related Documentation

- **Database Schema:** `database/schema/technician_scheduling.sql`
- **Status Notifications:** `docs/n8n-status-notification-workflow.md`
- **Service Bookings:** `database/schema/service_leads.sql`

---

## 🎯 Expected Results

After workflow is active:

✅ **Fast Assignment:** Bookings assigned within 2 minutes
✅ **High Auto-Rate:** 95%+ bookings auto-assigned
✅ **No Double-Bookings:** Zero conflicts
✅ **Optimal Routing:** Technicians assigned based on travel time
✅ **Calendar Sync:** Technician schedules updated automatically
✅ **Customer Confirmed:** SMS and email confirmations sent

The smart booking system provides efficient, automated technician assignment with optimal routing and zero double-bookings.
