# Notion Client Discovery Database Template - Setup Guide

Complete guide for setting up a Notion workspace to track client discovery form submissions with automated workflows and n8n integration.

---

## Table of Contents

1. [Main Database: Client Projects](#main-database-client-projects)
2. [Related Databases](#related-databases)
3. [Views Configuration](#views-configuration)
4. [Relations & Formulas](#relations--formulas)
5. [Automation Setup](#automation-setup)
6. [n8n Integration](#n8n-integration)

---

## Main Database: Client Projects

### Database Properties

Create a new database called **"Client Projects"** with the following properties:

| Property Name | Type | Options/Format | Required |
|--------------|------|-----------------|----------|
| **Title** | Title | - | ✅ Yes |
| Contact Name | Text | - | ❌ No |
| Email | Email | - | ✅ Yes |
| Phone | Phone | - | ❌ No |
| Industry | Select | See options below | ✅ Yes |
| Company Size | Select | See options below | ✅ Yes |
| Budget | Select | See options below | ✅ Yes |
| Features | Multi-select | See options below | ❌ No |
| AI Interests | Multi-select | See options below | ❌ No |
| Status | Select | See options below | ✅ Yes |
| Project Value | Number | Format: Currency ($) | ❌ No |
| Timeline | Date | Include time: No | ❌ No |
| Submission Date | Date | Include time: Yes | ✅ Yes |
| Consultation Date | Date | Include time: Yes | ❌ No |
| Discovery Form Link | URL | - | ❌ No |
| Notes | Text | - | ❌ No |
| Tasks | Relation | Related to: Tasks | ❌ No |
| Notes | Relation | Related to: Notes | ❌ No |
| Timeline Events | Relation | Related to: Timeline | ❌ No |

### Select Options

**Industry:**
- Retail
- Services
- Health
- Real Estate
- Non-Profit
- Tech
- Other

**Company Size:**
- Solo
- 2-5
- 6-20
- 20+

**Budget:**
- Under $2K
- $2-5K
- $5-10K
- $10K+

**Features (Multi-select):**
- Contact Forms
- Booking
- E-commerce
- Blog
- Login
- Gallery
- Analytics
- SEO
- Mobile App
- API Integration

**AI Interests (Multi-select):**
- Chatbot
- Automation
- Content Gen
- Personalization
- Analytics
- None

**Status:**
- Discovery
- Proposal
- Consultation Scheduled
- Design
- Development
- Testing
- Launch
- Complete
- Lost

### Property Setup Instructions

1. **Create Database:**
   - Click "+" → "Table" → "New database"
   - Name it "Client Projects"

2. **Add Properties:**
   - Click "+" next to "New" column
   - Add each property with correct type
   - Configure select options as listed above

3. **Set Defaults:**
   - Status: Default to "Discovery"
   - Submission Date: Use formula `now()` or set manually
   - Features: Leave empty (multi-select)

---

## Related Databases

### Database 1: Tasks

**Purpose:** Track project tasks, feature requirements, and deliverables

**Properties:**

| Property Name | Type | Options | Required |
|--------------|------|---------|----------|
| **Title** | Title | - | ✅ Yes |
| Project | Relation | Related to: Client Projects | ✅ Yes |
| Task Type | Select | Feature, Design, Development, Testing, Other | ✅ Yes |
| Status | Select | Not Started, In Progress, Review, Complete | ✅ Yes |
| Priority | Select | Low, Medium, High, Urgent | ❌ No |
| Assigned To | Person | - | ❌ No |
| Due Date | Date | Include time: No | ❌ No |
| Estimated Hours | Number | Format: Number | ❌ No |
| Completed Date | Date | Include time: Yes | ❌ No |
| Notes | Text | - | ❌ No |

**Select Options:**

**Task Type:**
- Feature Requirement
- Design Phase
- Development Task
- Testing Checklist
- Content Creation
- Integration
- Other

**Status:**
- Not Started
- In Progress
- Review
- Complete
- Blocked

**Priority:**
- Low
- Medium
- High
- Urgent

**Setup:**
1. Create new database: "Tasks"
2. Add relation to "Client Projects"
3. Configure relation: Two-way, show in both databases
4. Add other properties as listed

---

### Database 2: Notes

**Purpose:** Store discovery notes, call summaries, and decisions

**Properties:**

| Property Name | Type | Options | Required |
|--------------|------|---------|----------|
| **Title** | Title | - | ✅ Yes |
| Project | Relation | Related to: Client Projects | ✅ Yes |
| Note Type | Select | Discovery, Call Summary, Decision, General | ✅ Yes |
| Date | Date | Include time: Yes | ✅ Yes |
| Content | Text | - | ✅ Yes |
| Tags | Multi-select | Important, Follow-up, Decision, Question | ❌ No |
| Created By | Person | - | ❌ No |

**Select Options:**

**Note Type:**
- Discovery Notes
- Call Summary
- Decision Made
- General Notes
- Meeting Notes
- Email Summary

**Tags:**
- Important
- Follow-up Required
- Decision Made
- Question
- Budget Discussion
- Timeline Discussion

**Setup:**
1. Create new database: "Notes"
2. Add relation to "Client Projects"
3. Configure as two-way relation
4. Set default Date to `now()`

---

### Database 3: Timeline

**Purpose:** Calendar view of consultations, milestones, and launch dates

**Properties:**

| Property Name | Type | Options | Required |
|--------------|------|---------|----------|
| **Title** | Title | - | ✅ Yes |
| Project | Relation | Related to: Client Projects | ✅ Yes |
| Event Type | Select | Consultation, Milestone, Launch, Other | ✅ Yes |
| Date | Date | Include time: Yes | ✅ Yes |
| Duration | Number | Format: Number (hours) | ❌ No |
| Location | Text | Zoom, In-person, etc. | ❌ No |
| Description | Text | - | ❌ No |
| Status | Select | Scheduled, Completed, Cancelled | ✅ Yes |

**Select Options:**

**Event Type:**
- Consultation
- Design Review
- Milestone
- Launch
- Follow-up Call
- Other

**Status:**
- Scheduled
- Completed
- Cancelled
- Rescheduled

**Setup:**
1. Create new database: "Timeline"
2. Add relation to "Client Projects"
3. Configure as two-way relation
4. Set Date as primary sort for calendar view

---

## Views Configuration

### View 1: Table View - All Projects

**Name:** "All Projects"

**Configuration:**
- **View Type:** Table
- **Filters:** None (show all)
- **Sort:** Submission Date (Newest first)
- **Group By:** None
- **Properties Shown:**
  - Title
  - Status
  - Industry
  - Budget
  - Submission Date
  - Consultation Date
  - Project Value

**Setup:**
1. Click "Add a view" → "Table"
2. Name: "All Projects"
3. Configure columns to show
4. Set sort order

---

### View 2: Calendar View - By Consultation Date

**Name:** "Consultation Calendar"

**Configuration:**
- **View Type:** Calendar
- **Date Property:** Consultation Date
- **Filters:** 
  - Status is not "Complete"
  - Status is not "Lost"
- **Group By:** None
- **Properties Shown:**
  - Title
  - Consultation Date
  - Status
  - Email

**Setup:**
1. Click "Add a view" → "Calendar"
2. Select "Consultation Date" as date property
3. Add filters for active projects
4. Configure visible properties

---

### View 3: Gallery View - By Industry

**Name:** "Projects by Industry"

**Configuration:**
- **View Type:** Gallery
- **Group By:** Industry
- **Sort:** Submission Date (Newest first)
- **Card Preview:** Title, Industry, Status, Budget
- **Filters:** None

**Setup:**
1. Click "Add a view" → "Gallery"
2. Group by Industry
3. Configure card preview properties
4. Set sort order

---

### View 4: Timeline View - By Project Phase

**Name:** "Project Timeline"

**Configuration:**
- **View Type:** Timeline
- **Date Property:** Timeline (or Submission Date)
- **Group By:** Status
- **Filters:** 
  - Status is not "Complete"
  - Status is not "Lost"
- **Properties Shown:**
  - Title
  - Status
  - Timeline
  - Budget

**Setup:**
1. Click "Add a view" → "Timeline"
2. Select date property
3. Group by Status
4. Add filters

---

### View 5: Status Board - Kanban Style

**Name:** "Status Board"

**Configuration:**
- **View Type:** Board
- **Group By:** Status
- **Sort:** Submission Date (Newest first)
- **Filters:** None
- **Properties Shown:**
  - Title
  - Industry
  - Budget
  - Consultation Date

**Status Groups (in order):**
1. Discovery
2. Proposal
3. Consultation Scheduled
4. Design
5. Development
6. Testing
7. Launch
8. Complete
9. Lost

**Setup:**
1. Click "Add a view" → "Board"
2. Group by Status
3. Arrange status groups in order
4. Configure card properties
5. Set sort order

---

### View 6: Filtered Views

**Active Projects:**
- Filter: Status is not "Complete" AND Status is not "Lost"
- Sort: Submission Date (Newest first)

**High Value Projects:**
- Filter: Project Value is greater than $10,000
- Sort: Project Value (Highest first)

**Needs Follow-up:**
- Filter: Status is "Discovery" AND Submission Date is older than 3 days
- Sort: Submission Date (Oldest first)

**This Week Consultations:**
- Filter: Consultation Date is this week
- Sort: Consultation Date (Earliest first)

---

## Relations & Formulas

### Relation Setup

**Client Projects ↔ Tasks:**
- Two-way relation
- Show in both databases
- When project deleted: Delete related tasks (optional)

**Client Projects ↔ Notes:**
- Two-way relation
- Show in both databases
- When project deleted: Delete related notes (optional)

**Client Projects ↔ Timeline:**
- Two-way relation
- Show in both databases
- When project deleted: Delete related timeline events (optional)

### Formula Properties (Optional)

Add these formula properties to Client Projects for calculated values:

**Days Since Submission:**
```
dateBetween(prop("Submission Date"), now(), "days")
```

**Days Until Consultation:**
```
dateBetween(now(), prop("Consultation Date"), "days")
```

**Is Overdue:**
```
if(prop("Status") == "Discovery" and dateBetween(prop("Submission Date"), now(), "days") > 3, true, false)
```

**Total Tasks:**
```
length(prop("Tasks"))
```

**Completed Tasks:**
```
length(prop("Tasks").filter(current.prop("Status") == "Complete"))
```

**Completion Percentage:**
```
if(prop("Total Tasks") == 0, 0, round(prop("Completed Tasks") / prop("Total Tasks") * 100))
```

---

## Automation Setup

### Automation 1: Create Project from Form Submission

**Trigger:** Form submission webhook

**Actions:**
1. Create new page in "Client Projects" database
2. Set Title = Company Name
3. Set all form fields to corresponding properties
4. Set Status = "Discovery"
5. Set Submission Date = Current date/time
6. Create initial note in "Notes" database
7. Link note to project

**Setup in Notion:**
- Use Notion API or n8n (see n8n integration section)
- Cannot be done with native Notion automation

---

### Automation 2: Add Consultation to Calendar

**Trigger:** Status changes to "Consultation Scheduled"

**Actions:**
1. Create new page in "Timeline" database
2. Set Event Type = "Consultation"
3. Set Date = Consultation Date from project
4. Set Status = "Scheduled"
5. Link to project

**Setup:**
- Use Notion API automation (n8n/Zapier)
- Or manual template button

---

### Automation 3: Create Design Phase Tasks

**Trigger:** Status changes to "Design"

**Actions:**
1. Create tasks in "Tasks" database:
   - "Design Mockups"
   - "Design Review"
   - "Design Revisions"
   - "Final Design Approval"
2. Set Task Type = "Design Phase"
3. Link all tasks to project
4. Set due dates based on project timeline

**Setup:**
- Use Notion API automation
- Or create template button

---

### Automation 4: Archive Completed Projects

**Trigger:** Status changes to "Complete"

**Actions:**
1. Move project to "Completed Projects" view (filtered view)
2. Set Completion Date (add property if needed)
3. Calculate project duration
4. Update project value if not set

**Setup:**
- Use filtered view for archive
- Or create separate "Archive" database

---

## n8n Integration

### Step 1: Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click **"New integration"**
3. Name: "n8n Discovery Form"
4. Select workspace
5. Copy **Internal Integration Token**
6. Save

### Step 2: Share Databases with Integration

1. Open each database (Client Projects, Tasks, Notes, Timeline)
2. Click **"..."** (three dots) → **"Add connections"**
3. Select your integration
4. Grant access

### Step 3: Get Database IDs

**Client Projects Database ID:**
1. Open Client Projects database
2. Copy URL: `https://notion.so/YOUR_WORKSPACE/DATABASE_ID_HERE?v=...`
3. Extract Database ID (32 characters, alphanumeric)

**Repeat for:**
- Tasks database
- Notes database
- Timeline database

### Step 4: Configure n8n Notion Node

**Node Configuration:**

```javascript
// n8n Notion Node Settings
{
  "resource": "database",
  "operation": "create",
  "databaseId": "YOUR_CLIENT_PROJECTS_DATABASE_ID",
  "title": "={{ $json.companyName }}",
  "properties": {
    "Contact Name": {
      "type": "rich_text",
      "rich_text": [{
        "text": { "content": "={{ $json.contactName || '' }}" }
      }]
    },
    "Email": {
      "type": "email",
      "email": "={{ $json.email }}"
    },
    "Phone": {
      "type": "phone_number",
      "phone_number": "={{ $json.phone || '' }}"
    },
    "Industry": {
      "type": "select",
      "select": { "name": "={{ $json.industry }}" }
    },
    "Company Size": {
      "type": "select",
      "select": { "name": "={{ $json.companySize }}" }
    },
    "Budget": {
      "type": "select",
      "select": { "name": "={{ $json.budget }}" }
    },
    "Features": {
      "type": "multi_select",
      "multi_select": "={{ $json.features.map(f => ({ name: f })) }}"
    },
    "AI Interests": {
      "type": "multi_select",
      "multi_select": "={{ $json.aiFeatures.map(f => ({ name: f })) }}"
    },
    "Status": {
      "type": "select",
      "select": { "name": "Discovery" }
    },
    "Submission Date": {
      "type": "date",
      "date": {
        "start": "={{ $json.submittedAt }}"
      }
    },
    "Discovery Form Link": {
      "type": "url",
      "url": "={{ $json.formLink }}"
    }
  }
}
```

### Step 5: Create Related Entries

**After creating project, create note:**

```javascript
// Create Note Entry
{
  "resource": "database",
  "operation": "create",
  "databaseId": "YOUR_NOTES_DATABASE_ID",
  "title": "Discovery Form Submission - {{ $json.companyName }}",
  "properties": {
    "Project": {
      "type": "relation",
      "relation": [{ "id": "={{ $('Create Project').item.json.id }}" }]
    },
    "Note Type": {
      "type": "select",
      "select": { "name": "Discovery Notes" }
    },
    "Date": {
      "type": "date",
      "date": { "start": "={{ $json.submittedAt }}" }
    },
    "Content": {
      "type": "rich_text",
      "rich_text": [{
        "text": {
          "content": "Form submitted via discovery form.\n\nMain Problem: {{ $json.mainProblem }}\nSuccess Metric: {{ $json.successMetric }}\nTarget Customer: {{ $json.targetCustomer }}"
        }
      }]
    }
  }
}
```

### Step 6: Complete n8n Workflow

**Workflow Structure:**

```
Webhook Trigger
  ↓
Parse Form Data
  ↓
Create Notion Project Entry
  ↓
Create Notion Note Entry
  ↓
Create Timeline Event (if consultation scheduled)
  ↓
Send Confirmation Email
```

**Full n8n Node Configuration:**

See `n8n-notion-integration-example.json` for complete workflow.

---

## Template Button Setup

### Button 1: Create Design Tasks

**Purpose:** Quickly create design phase tasks

**Setup:**
1. Add button to Client Projects database
2. Button name: "Start Design Phase"
3. Actions:
   - Update Status to "Design"
   - Create 4 tasks in Tasks database
   - Link tasks to project

**Button Actions:**
```
Update this page:
  Status → Design

Create pages in Tasks:
  Title: Design Mockups
  Task Type: Design Phase
  Project: [This page]
  Status: Not Started
  Due Date: [Timeline + 7 days]
  
  Title: Design Review
  Task Type: Design Phase
  Project: [This page]
  Status: Not Started
  Due Date: [Timeline + 14 days]
  
  (Repeat for other tasks)
```

---

## Database Templates

### Template: New Project

**Purpose:** Pre-filled template for manual project creation

**Properties Pre-filled:**
- Status: Discovery
- Submission Date: Today
- Features: (empty, ready to select)
- AI Interests: (empty, ready to select)

**Setup:**
1. Create a project with desired defaults
2. Click "..." → "Turn into template"
3. Name: "New Project Template"
4. Use template when creating new projects manually

---

## Best Practices

### Data Entry

1. **Always set Status:** Update status as project progresses
2. **Link related items:** Always link tasks, notes, and timeline events
3. **Use consistent naming:** Follow naming conventions for tasks and notes
4. **Update dates:** Keep consultation dates and timelines current
5. **Add notes:** Document important decisions and conversations

### Views Usage

1. **Daily:** Check "Status Board" for active projects
2. **Weekly:** Review "Consultation Calendar" for upcoming calls
3. **Monthly:** Check "Needs Follow-up" for stale leads
4. **Quarterly:** Review "High Value Projects" for revenue tracking

### Automation

1. **Test automations:** Test all automations with sample data first
2. **Monitor errors:** Check n8n execution logs regularly
3. **Update mappings:** Keep n8n field mappings updated with form changes
4. **Backup data:** Export databases regularly

---

## Troubleshooting

### n8n Not Creating Entries

**Check:**
1. Integration token is correct
2. Database IDs are correct
3. Database is shared with integration
4. Property names match exactly (case-sensitive)
5. Property types match (select, multi-select, etc.)

### Relations Not Working

**Check:**
1. Both databases are shared with integration
2. Relation property exists in both databases
3. Relation is configured as two-way
4. Database IDs are correct in n8n

### Views Not Showing Data

**Check:**
1. Filters are not too restrictive
2. Properties exist and are populated
3. Sort order is correct
4. Group by property has values

---

## Export Template

To share this template:

1. **Export as Template:**
   - Click workspace settings
   - Export → Template
   - Share template link

2. **Duplicate Workspace:**
   - Share workspace with team
   - Team members can duplicate

3. **Manual Setup:**
   - Follow this guide step-by-step
   - Copy database structures

---

## Support

- Notion Help: https://www.notion.so/help
- Notion API Docs: https://developers.notion.com
- n8n Notion Node: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/

---

**Template Version:** 1.0  
**Last Updated:** 2024-01-01  
**Compatible with:** Notion, n8n


