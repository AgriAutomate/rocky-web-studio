# Google Sheets Template - Quick Setup Guide

## Option 1: Manual Setup (15 minutes)

1. **Create New Google Sheet**
   - Go to https://sheets.google.com
   - Click "Blank" to create new sheet
   - Rename to "Client Discovery Tracker"

2. **Create 4 Sheets**
   - Click "+" button 3 times to create 3 additional sheets
   - Rename sheets:
     - Sheet1 → "Leads Pipeline"
     - Sheet2 → "Analytics"
     - Sheet3 → "Status Tracking"
     - Sheet4 → "Questions Reference"

3. **Set Up Leads Pipeline Sheet**
   - Copy headers from the guide (Column A-N)
   - Format header row (purple background, white text, bold)
   - Add data validation dropdowns
   - Freeze header row

4. **Add Formulas**
   - Copy formulas from guide into Analytics and Status Tracking sheets
   - Verify formulas work correctly

5. **Create Charts**
   - Follow chart setup instructions in guide
   - Position charts below data tables

## Option 2: Import CSV Template (5 minutes)

1. **Download CSV Template**
   - Use `google-sheets-template-setup.csv` file
   - Contains sample data structure

2. **Import to Google Sheets**
   - File → Import → Upload
   - Select CSV file
   - Import location: New sheet
   - Click "Import data"

3. **Rename Sheet**
   - Rename imported sheet to "Leads Pipeline"

4. **Add Other Sheets**
   - Create Analytics, Status Tracking, Questions Reference sheets
   - Copy formulas from guide

5. **Delete Sample Data**
   - Delete sample rows (keep headers)
   - Ready for real data

## Option 3: Copy from Template (2 minutes)

If someone shares a template with you:

1. **Open Shared Template**
   - Click shared link
   - File → Make a copy
   - Rename your copy

2. **Customize**
   - Update formulas if needed
   - Adjust colors/branding
   - Add your team members

3. **Connect n8n**
   - Get Sheet ID from URL
   - Configure n8n node
   - Test connection

## Quick Formula Reference

### Count Submissions This Month
```
=COUNTIF('Leads Pipeline'!A:A,">="&EOMONTH(TODAY(),-1)+1)
```

### Count by Status
```
=COUNTIF('Leads Pipeline'!K:K,"Won")
```

### Sum Pipeline Value
```
=SUMIF('Leads Pipeline'!K:K,"Won",'Leads Pipeline'!M:M)
```

### Conversion Rate
```
=(COUNTIF('Leads Pipeline'!K:K,"Won")/COUNTIF('Leads Pipeline'!K:K,"Call Completed"))*100
```

## n8n Quick Connect

1. **Get Sheet ID:**
   - Open your Google Sheet
   - Copy ID from URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Example: `1a2b3c4d5e6f7g8h9i0j`

2. **In n8n:**
   - Add Google Sheets node
   - Operation: Append
   - Document ID: Paste Sheet ID
   - Sheet Name: `Leads Pipeline`
   - Map columns (see guide)

3. **Test:**
   - Submit test form
   - Check Google Sheet for new row

## Common Issues

**Formulas showing as text:**
- Select cells → Format → Number → Automatic

**Charts not updating:**
- Right-click chart → Update
- Check data range includes new rows

**n8n can't append:**
- Check Sheet name matches exactly
- Verify service account has Editor access
- Test with manual row first

## Need Help?

- Full guide: `google-sheets-discovery-template-guide.md`
- n8n docs: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/
- Google Sheets help: https://support.google.com/sheets





