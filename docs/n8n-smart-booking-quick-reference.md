# Smart Booking & Scheduling - Quick Reference

## 🎯 Workflow Summary

**Name:** Auto-Schedule & Route Optimization

**Trigger:** New booking with `urgency = 'today'` or `'next_48h'`

**Purpose:** Automatically assign technicians based on skills, availability, and optimal routing

---

## 🔄 Assignment Algorithm

1. **Extract Requirements:** Service type, date, time, location, duration
2. **Find Eligible Techs:** Skills match, available, has capacity
3. **Calculate Routing:** Travel time from last job to customer
4. **Prevent Conflicts:** Check for double-bookings
5. **Assign Best:** Lowest travel time + load score
6. **Confirm:** SMS + Email to customer

---

## 📊 Success Metrics

| Metric | Goal |
|--------|------|
| **Average Assignment Time** | < 2 minutes |
| **Auto-Assignment Rate** | 95%+ |
| **Double-Booking Rate** | 0% |
| **Tech Cancellation Rate** | < 2% |
| **Technician Utilization** | 80%+ (4hrs/day) |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `technician_availability` | Schedule windows and capacity |
| `technician_skills` | Skill matrix for matching |
| `service_skill_requirements` | Required skills per service |
| `manual_assignments` | Queue for manual assignment |

---

## 🔌 Integrations

- **Google Maps API:** Travel time calculation
- **Google Calendar:** Technician schedule sync
- **Mobile Message:** SMS confirmations (ACMA-approved Sender ID: "Rocky Web")
- **Resend:** Email confirmations

---

## 🚀 Setup Checklist

- [ ] Run database migrations
- [ ] Add `estimated_duration_minutes` to service_types
- [ ] Populate technician availability
- [ ] Populate technician skills
- [ ] Configure Google Maps API
- [ ] Set up Google Calendar integration
- [ ] Test assignment algorithm
- [ ] Verify double-booking prevention
- [ ] Workflow activated

---

## 📚 Full Documentation

See `docs/n8n-smart-booking-workflow.md` for complete setup instructions.
