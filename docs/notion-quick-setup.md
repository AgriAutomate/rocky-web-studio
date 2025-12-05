# Notion Discovery Database - Quick Setup

## 5-Minute Setup Guide

### Step 1: Create Main Database (2 minutes)

1. **Create Database:**
   - Click "+" → "Table" → "New database"
   - Name: "Client Projects"

2. **Add Essential Properties:**
   - Title (default)
   - Email (Email type)
   - Status (Select: Discovery, Proposal, Design, Development, Testing, Launch, Complete, Lost)
   - Industry (Select: Retail, Services, Health, Real Estate, Non-Profit, Tech, Other)
   - Budget (Select: Under $2K, $2-5K, $5-10K, $10K+)
   - Submission Date (Date)

3. **Format Header:**
   - Select header row
   - Background: Purple (#667eea)
   - Text: White, Bold

### Step 2: Create Views (1 minute)

1. **Table View:**
   - Click "Add a view" → "Table"
   - Name: "All Projects"
   - Sort: Submission Date (Newest first)

2. **Board View:**
   - Click "Add a view" → "Board"
   - Name: "Status Board"
   - Group by: Status

3. **Calendar View:**
   - Click "Add a view" → "Calendar"
   - Name: "Consultation Calendar"
   - Date property: Consultation Date

### Step 3: Connect n8n (2 minutes)

1. **Create Notion Integration:**
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Name: "n8n Discovery"
   - Copy token

2. **Share Database:**
   - Open Client Projects database
   - Click "..." → "Add connections"
   - Select your integration

3. **Get Database ID:**
   - Copy from URL: `notion.so/.../DATABASE_ID_HERE`
   - Use in n8n node

4. **Import n8n Workflow:**
   - Import `n8n-notion-integration-example.json`
   - Update Database IDs
   - Add Notion credentials
   - Test with sample data

## Property Quick Reference

### Required Properties
- Title (Company Name)
- Email
- Status
- Submission Date

### Optional Properties
- Contact Name
- Phone
- Industry
- Company Size
- Budget
- Features (multi-select)
- AI Interests (multi-select)
- Project Value
- Timeline
- Consultation Date

## Status Flow

```
Discovery → Proposal → Consultation Scheduled → Design → Development → Testing → Launch → Complete
                                                                                      ↓
                                                                                    Lost
```

## Quick Actions

### Create New Project Manually
1. Click "New" in database
2. Enter Company Name (Title)
3. Fill required fields
4. Set Status = "Discovery"
5. Set Submission Date = Today

### Update Status
1. Click on project
2. Change Status dropdown
3. Save

### Add Note
1. Open project page
2. Type "/" → "Linked database"
3. Select "Notes" database
4. Create new note

## Common Issues

**n8n not creating entries:**
- Check integration token
- Verify database is shared with integration
- Check Database ID is correct

**Properties not showing:**
- Refresh page
- Check property names match exactly
- Verify property types match

**Relations not working:**
- Ensure both databases shared with integration
- Check relation is two-way
- Verify database IDs

## Next Steps

1. ✅ Set up main database
2. ✅ Create views
3. ✅ Connect n8n
4. 📋 Add related databases (Tasks, Notes, Timeline)
5. 📋 Set up automations
6. 📋 Create templates

For detailed setup, see: `notion-discovery-database-setup.md`





