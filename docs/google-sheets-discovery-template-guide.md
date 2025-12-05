# Google Sheets Discovery Form Tracking Template - Setup Guide

Complete guide for setting up a Google Sheets template to track client discovery form submissions with automatic formulas, charts, and n8n integration.

---

## Table of Contents

1. [Sheet 1: Leads Pipeline](#sheet-1-leads-pipeline)
2. [Sheet 2: Analytics](#sheet-2-analytics)
3. [Sheet 3: Status Tracking](#sheet-3-status-tracking)
4. [Sheet 4: Questions Reference](#sheet-4-questions-reference)
5. [n8n Integration](#n8n-integration)
6. [Charts Setup](#charts-setup)

---

## Sheet 1: Leads Pipeline

### Column Structure

| Column | Header | Data Type | Format | Notes |
|--------|--------|-----------|--------|-------|
| A | Date Submitted | Date/Time | MM/DD/YYYY HH:MM | Auto-filled by n8n |
| B | Company Name | Text | - | Required |
| C | Contact Name | Text | - | Optional |
| D | Email | Email | - | Required |
| E | Phone | Text | (XXX) XXX-XXXX | Optional |
| F | Industry | Text | - | Dropdown list |
| G | Company Size | Text | - | Dropdown list |
| H | Budget Range | Text | - | Dropdown list |
| I | Features Needed | Text | Comma-separated | Multiple values |
| J | AI Interests | Text | Comma-separated | Multiple values |
| K | Status | Text | - | Dropdown: Received, Scheduled, Call Completed, Won, Lost |
| L | Consultation Date | Date | MM/DD/YYYY | Optional |
| M | Project Value | Currency | $X,XXX.XX | Only if Won |
| N | Notes | Text | - | Free text |

### Setup Instructions

1. **Create Sheet:**
   - Name: "Leads Pipeline"
   - Freeze Row 1 (View → Freeze → 1 row)

2. **Header Row (Row 1):**
   ```
   A1: Date Submitted
   B1: Company Name
   C1: Contact Name
   D1: Email
   E1: Phone
   F1: Industry
   G1: Company Size
   H1: Budget Range
   I1: Features Needed
   J1: AI Interests
   K1: Status
   L1: Consultation Date
   M1: Project Value
   N1: Notes
   ```

3. **Format Header Row:**
   - Bold text
   - Background color: `#667eea` (Purple)
   - Text color: White
   - Center align
   - Wrap text

4. **Data Validation (Dropdown Lists):**

   **Column F (Industry):**
   - Select Column F (excluding header)
   - Data → Data validation
   - Criteria: List of items
   - Items: `Retail / E-commerce, Healthcare, Finance / Banking, Education, Technology / SaaS, Real Estate, Hospitality / Tourism, Manufacturing, Professional Services, Non-profit, Other`
   - Show dropdown list in cell: ✅

   **Column G (Company Size):**
   - Data validation → List of items
   - Items: `Solo (Just me), 2-5 employees, 6-20 employees, 21-50 employees, 51-200 employees, 200+ employees`

   **Column H (Budget Range):**
   - Data validation → List of items
   - Items: `Under $2,000, $2,000 - $5,000, $5,000 - $10,000, $10,000 - $25,000, $25,000 - $50,000, $50,000+, Prefer not to say`

   **Column K (Status):**
   - Data validation → List of items
   - Items: `Received, Scheduled, Call Completed, Won, Lost`

5. **Conditional Formatting:**

   **Status Column (K):**
   - Select Column K
   - Format → Conditional formatting
   - Rules:
     - If Status = "Received" → Background: `#FFF7ED` (Light orange)
     - If Status = "Scheduled" → Background: `#DBEAFE` (Light blue)
     - If Status = "Call Completed" → Background: `#F0FDFA` (Light green)
     - If Status = "Won" → Background: `#D1FAE5` (Green)
     - If Status = "Lost" → Background: `#FEE2E2` (Light red)

6. **Auto-Formatting:**
   - Column A: Date format
   - Column M: Currency format ($X,XXX.00)
   - Column D: Email format (optional)

---

## Sheet 2: Analytics

### Row Structure

| Row | Label | Formula | Notes |
|-----|-------|---------|-------|
| 1 | **Metrics** | - | Header row |
| 2 | Form Opens This Month | `=COUNTIF('Leads Pipeline'!A:A,">="&EOMONTH(TODAY(),-1)+1)` | Count submissions this month |
| 3 | Form Completions This Month | `=COUNTIFS('Leads Pipeline'!A:A,">="&EOMONTH(TODAY(),-1)+1,'Leads Pipeline'!K:K,"<>")` | Count non-empty statuses |
| 4 | Completion Rate (%) | `=IF(B2=0,0,(B3/B2)*100)` | Percentage |
| 5 | Average Time to Complete | `=AVERAGE('Leads Pipeline'!O:O)` | Requires completion time column |
| 6 | **Conversion Rates** | - | Header |
| 7 | Submissions → Scheduled Calls | `=IF(B3=0,0,(COUNTIFS('Leads Pipeline'!K:K,"Scheduled")/B3)*100)` | Percentage |
| 8 | Calls → Projects Won | `=IF(COUNTIF('Leads Pipeline'!K:K,"Call Completed")=0,0,(COUNTIF('Leads Pipeline'!K:K,"Won")/COUNTIF('Leads Pipeline'!K:K,"Call Completed"))*100)` | Percentage |
| 9 | **Pipeline Value** | - | Header |
| 10 | Total Pipeline Value | `=SUMIF('Leads Pipeline'!K:K,"Won",'Leads Pipeline'!M:M)` | Sum of won projects |

### Charts Setup

#### Budget Distribution (Pie Chart)

1. **Data Range:** Create helper table
   ```
   Column A: Budget Range
   Column B: Count
   
   A15: Under $2,000
   A16: $2,000 - $5,000
   A17: $5,000 - $10,000
   A18: $10,000 - $25,000
   A19: $25,000 - $50,000
   A20: $50,000+
   A21: Prefer not to say
   
   B15: =COUNTIF('Leads Pipeline'!H:H,"Under $2,000")
   B16: =COUNTIF('Leads Pipeline'!H:H,"$2,000 - $5,000")
   B17: =COUNTIF('Leads Pipeline'!H:H,"$5,000 - $10,000")
   B18: =COUNTIF('Leads Pipeline'!H:H,"$10,000 - $25,000")
   B19: =COUNTIF('Leads Pipeline'!H:H,"$25,000 - $50,000")
   B20: =COUNTIF('Leads Pipeline'!H:H,"$50,000+")
   B21: =COUNTIF('Leads Pipeline'!H:H,"Prefer not to say")
   ```

2. **Create Chart:**
   - Select A15:B21
   - Insert → Chart
   - Chart type: Pie chart
   - Title: "Budget Distribution"
   - Position: Below data table

#### Industry Breakdown (Pie Chart)

1. **Data Range:**
   ```
   Column D: Industry
   Column E: Count
   
   D15: Retail / E-commerce
   D16: Healthcare
   D17: Finance / Banking
   D18: Education
   D19: Technology / SaaS
   D20: Real Estate
   D21: Hospitality / Tourism
   D22: Manufacturing
   D23: Professional Services
   D24: Non-profit
   D25: Other
   
   E15: =COUNTIF('Leads Pipeline'!F:F,"Retail / E-commerce")
   E16: =COUNTIF('Leads Pipeline'!F:F,"Healthcare")
   ... (repeat for each industry)
   ```

2. **Create Chart:** Same as Budget Distribution

#### Most Requested Features (Bar Chart)

1. **Data Range:** Create feature count table
   ```
   Column G: Feature
   Column H: Count
   
   G15: E-commerce
   G16: Blog
   G17: Booking System
   G18: Contact Forms
   G19: Membership
   G20: Analytics
   G21: SEO
   G22: Mobile App
   
   H15: =COUNTIF('Leads Pipeline'!I:I,"*E-commerce*")
   H16: =COUNTIF('Leads Pipeline'!I:I,"*Blog*")
   ... (repeat for each feature)
   ```

2. **Create Chart:**
   - Select G15:H22
   - Insert → Chart
   - Chart type: Column chart (bar chart)
   - Title: "Most Requested Features"
   - Sort descending

---

## Sheet 3: Status Tracking

### Structure

| Row | Label | Formula | Notes |
|-----|-------|---------|-------|
| 1 | **This Month** | - | Header |
| 2 | Form Opens | `=COUNTIF('Leads Pipeline'!A:A,">="&EOMONTH(TODAY(),-1)+1)` | Count this month |
| 3 | Form Completions | `=COUNTIFS('Leads Pipeline'!A:A,">="&EOMONTH(TODAY(),-1)+1,'Leads Pipeline'!B:B,"<>")` | Non-empty company names |
| 4 | Booked Calls | `=COUNTIFS('Leads Pipeline'!A:A,">="&EOMONTH(TODAY(),-1)+1,'Leads Pipeline'!K:K,"Scheduled")` | Status = Scheduled |
| 5 | Completed Calls | `=COUNTIFS('Leads Pipeline'!A:A,">="&EOMONTH(TODAY(),-1)+1,'Leads Pipeline'!K:K,"Call Completed")` | Status = Call Completed |
| 6 | Projects Won | `=COUNTIFS('Leads Pipeline'!A:A,">="&EOMONTH(TODAY(),-1)+1,'Leads Pipeline'!K:K,"Won")` | Status = Won |
| 7 | **Total Pipeline Value** | - | Header |
| 8 | This Month | `=SUMIFS('Leads Pipeline'!M:M,'Leads Pipeline'!A:A,">="&EOMONTH(TODAY(),-1)+1,'Leads Pipeline'!K:K,"Won")` | Sum won projects this month |
| 9 | All Time | `=SUMIF('Leads Pipeline'!K:K,"Won",'Leads Pipeline'!M:M)` | Total pipeline value |

### Additional Metrics (Optional)

| Row | Label | Formula |
|-----|-------|---------|
| 11 | **Conversion Funnel** | - |
| 12 | Opens → Completions | `=IF(B2=0,0,(B3/B2)*100)` |
| 13 | Completions → Calls | `=IF(B3=0,0,(B4/B3)*100)` |
| 14 | Calls → Won | `=IF(B5=0,0,(B6/B5)*100)` |

---

## Sheet 4: Questions Reference

### Structure

Store the exact form questions for reference:

| Column | Content |
|--------|---------|
| A | Question Number |
| B | Section |
| C | Question Text |
| D | Field Type |
| E | Required? |
| F | Options (if applicable) |
| G | Notes |

### Example Data

```
Row 1 (Headers):
A1: # | B1: Section | C1: Question | D1: Type | E1: Required | F1: Options | G1: Notes

Row 2:
A2: 1 | B2: Welcome | C2: Welcome Screen | D2: Statement | E2: No | F2: - | G2: Introduction

Row 3:
A3: 2 | B3: Company Info | C3: What's your company name? | D3: Short text | E3: Yes | F3: - | G3: Max 100 chars

Row 4:
A4: 3 | B4: Company Info | C4: What's your email address? | D4: Email | E4: Yes | F4: - | G4: Validation required

Row 5:
A5: 4 | B5: Company Info | C5: How many employees? | D5: Multiple choice | E5: Yes | F5: Solo, 2-5, 6-20, 21-50, 51-200, 200+ | G5: Single selection

... (continue for all questions)
```

### Version Tracking

Add version history at the bottom:

```
Row 50: **Version History**
Row 51: v1.0 - 2024-01-01 - Initial form questions
Row 52: v1.1 - 2024-02-15 - Added AI features question
```

---

## n8n Integration

### Step 1: Prepare Google Sheets

1. **Create the template** using the structure above
2. **Share the sheet** with your n8n service account email
3. **Get Sheet ID** from URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
4. **Note the sheet name:** "Leads Pipeline"

### Step 2: Configure n8n Google Sheets Node

1. **Add Google Sheets Node** to your workflow
2. **Operation:** Append
3. **Document ID:** Your Sheet ID
4. **Sheet Name:** Leads Pipeline

### Step 3: Map Form Data to Columns

In n8n, map your form data to columns:

```javascript
// Column mapping in n8n Google Sheets node
{
  "Date Submitted": "={{ $json.submittedAt }}",
  "Company Name": "={{ $json.companyName }}",
  "Contact Name": "={{ $json.contactName || '' }}",
  "Email": "={{ $json.email }}",
  "Phone": "={{ $json.phone || '' }}",
  "Industry": "={{ $json.industry }}",
  "Company Size": "={{ $json.companySize }}",
  "Budget Range": "={{ $json.budget }}",
  "Features Needed": "={{ $json.features.join(', ') }}",
  "AI Interests": "={{ $json.aiFeatures.join(', ') || 'None' }}",
  "Status": "Received",
  "Consultation Date": "",
  "Project Value": "",
  "Notes": ""
}
```

### Step 4: Complete n8n Node Configuration

**Node Settings:**
- **Credential:** Google Sheets OAuth2 API
- **Operation:** Append
- **Document ID:** `YOUR_SHEET_ID`
- **Sheet Name:** `Leads Pipeline`
- **Columns:** Use mapping above

**Test the connection:**
1. Submit a test form
2. Check n8n execution logs
3. Verify row appears in Google Sheets

---

## Advanced Formulas

### Follow-Up Tracking

Add to Sheet 1 (Leads Pipeline):

**Column O: Days Since Submission**
```
O2: =IF(A2="","",TODAY()-A2)
```

**Column P: Follow-Up Due**
```
P2: =IF(K2="Received",IF(O2>=3,"Yes","No"),"")
```

**Column Q: Next Action Date**
```
Q2: =IF(K2="Scheduled",L2,IF(K2="Received",A2+3,""))
```

### Status Change Tracking

**Column R: Status Changed Date**
```
R2: =IF(K2<>"",TODAY(),"")
```
(Update manually or via script when status changes)

### Pipeline Velocity

Add to Sheet 3:

**Average Days to Close:**
```
=AVERAGEIF('Leads Pipeline'!K:K,"Won",'Leads Pipeline'!O:O)
```

---

## Charts Setup

### Creating Charts in Google Sheets

1. **Select data range** (e.g., A15:B21)
2. **Insert → Chart**
3. **Chart Editor:**
   - Chart type: Select appropriate type
   - Data range: Verify range
   - X-axis: First column
   - Series: Second column
   - Title: Add descriptive title
   - Colors: Use brand colors (#667eea, #764ba2)

### Chart Positioning

- Place charts below data tables
- Size: Medium (400x300px)
- Update automatically when data changes

---

## Automation Scripts (Optional)

### Auto-Update Status Based on Date

Add Google Apps Script:

```javascript
function updateStatusFromConsultation() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads Pipeline');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var consultationDate = data[i][11]; // Column L
    var status = data[i][10]; // Column K
    var today = new Date();
    
    if (consultationDate && status === 'Scheduled') {
      if (consultationDate <= today) {
        sheet.getRange(i + 1, 11).setValue('Call Completed');
      }
    }
  }
}
```

**Set up trigger:**
- Edit → Current project's triggers
- Add trigger: `updateStatusFromConsultation`
- Time-driven: Daily at 9 AM

---

## Sharing & Permissions

### Recommended Permissions

1. **Owner:** You (full access)
2. **Editor:** Team members (can edit)
3. **Viewer:** Stakeholders (read-only)
4. **Service Account:** n8n (Editor - for auto-append)

### Share Settings

- **Anyone with the link:** View only (for reports)
- **Specific people:** Editor access
- **Service account:** Editor access (for n8n)

---

## Maintenance

### Weekly Tasks

- Review Status column for updates
- Update Consultation Date when calls are scheduled
- Update Project Value when deals close
- Add Notes for important updates

### Monthly Tasks

- Review Analytics sheet
- Check conversion rates
- Update charts if needed
- Archive old data (optional)

### Quarterly Tasks

- Review form questions (Sheet 4)
- Update dropdown lists if needed
- Optimize formulas
- Clean up old data

---

## Troubleshooting

### n8n Not Appending Data

1. **Check credentials:** Verify Google Sheets OAuth2 is connected
2. **Check permissions:** Ensure service account has Editor access
3. **Verify Sheet ID:** Double-check Sheet ID in n8n node
4. **Check Sheet name:** Must match exactly (case-sensitive)
5. **Test manually:** Try appending a row manually first

### Formulas Not Updating

1. **Check data format:** Ensure dates are actual date format
2. **Check cell references:** Verify column letters match
3. **Recalculate:** Press Ctrl+Shift+F9 (Windows) or Cmd+Shift+F9 (Mac)

### Charts Not Showing Data

1. **Check data range:** Verify range includes all data
2. **Check for empty cells:** Remove empty rows from range
3. **Refresh chart:** Right-click chart → Update

---

## Template Checklist

Before using the template:

- [ ] All sheets created with correct names
- [ ] Headers formatted and frozen
- [ ] Data validation dropdowns set up
- [ ] Conditional formatting applied
- [ ] Formulas entered correctly
- [ ] Charts created and positioned
- [ ] n8n integration tested
- [ ] Permissions set correctly
- [ ] Test data added and verified

---

## Quick Start

1. **Create new Google Sheet**
2. **Copy structure** from this guide
3. **Set up formulas** in each sheet
4. **Create charts** using data ranges
5. **Connect n8n** using Sheet ID
6. **Test** with sample submission
7. **Share** with team

---

## Support

For questions or issues:
- Check Google Sheets Help: https://support.google.com/sheets
- Review n8n documentation: https://docs.n8n.io
- Contact: hello@rockywebstudio.com.au

---

**Template Version:** 1.0  
**Last Updated:** 2024-01-01  
**Compatible with:** Google Sheets, n8n





