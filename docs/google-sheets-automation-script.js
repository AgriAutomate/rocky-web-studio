/**
 * Google Apps Script for Client Discovery Form Tracking
 * 
 * Features:
 * - Auto-update status based on consultation date
 * - Send email reminders for follow-ups
 * - Auto-calculate metrics
 * - Archive old records
 * 
 * Setup:
 * 1. Open Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Save and authorize
 * 5. Set up triggers (see bottom of script)
 */

// Configuration
const CONFIG = {
  sheetName: 'Leads Pipeline',
  statusColumn: 11, // Column K (1-indexed)
  consultationDateColumn: 12, // Column L
  dateSubmittedColumn: 1, // Column A
  emailColumn: 4, // Column D
  companyNameColumn: 2, // Column B
  notesColumn: 14, // Column N
  daysUntilFollowUp: 3,
  archiveAfterDays: 365
};

/**
 * Main function to update statuses based on consultation dates
 * Run this daily via trigger
 */
function updateStatusFromConsultation() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  if (!sheet) {
    Logger.log('Sheet not found: ' + CONFIG.sheetName);
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let updated = 0;
  
  // Start from row 2 (skip header)
  for (let i = 1; i < data.length; i++) {
    const row = i + 1; // Sheet row number (1-indexed)
    const status = data[i][CONFIG.statusColumn - 1];
    const consultationDate = data[i][CONFIG.consultationDateColumn - 1];
    
    // Update status if consultation date has passed and status is "Scheduled"
    if (consultationDate instanceof Date && status === 'Scheduled') {
      const consultDate = new Date(consultationDate);
      consultDate.setHours(0, 0, 0, 0);
      
      if (consultDate <= today) {
        sheet.getRange(row, CONFIG.statusColumn).setValue('Call Completed');
        updated++;
        Logger.log('Updated row ' + row + ' to Call Completed');
      }
    }
  }
  
  Logger.log('Updated ' + updated + ' rows');
}

/**
 * Calculate days since submission for each lead
 * Updates a helper column (add column O for this)
 */
function calculateDaysSinceSubmission() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  
  // Column O (15) for days since submission
  const daysColumn = 15;
  
  for (let i = 1; i < data.length; i++) {
    const row = i + 1;
    const submittedDate = data[i][CONFIG.dateSubmittedColumn - 1];
    
    if (submittedDate instanceof Date) {
      const daysDiff = Math.floor((today - submittedDate) / (1000 * 60 * 60 * 24));
      sheet.getRange(row, daysColumn).setValue(daysDiff);
    }
  }
}

/**
 * Send email reminders for leads needing follow-up
 * Leads with status "Received" older than 3 days
 */
function sendFollowUpReminders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reminders = [];
  
  for (let i = 1; i < data.length; i++) {
    const status = data[i][CONFIG.statusColumn - 1];
    const submittedDate = data[i][CONFIG.dateSubmittedColumn - 1];
    const email = data[i][CONFIG.emailColumn - 1];
    const companyName = data[i][CONFIG.companyNameColumn - 1];
    
    if (status === 'Received' && submittedDate instanceof Date && email) {
      const daysSince = Math.floor((today - submittedDate) / (1000 * 60 * 60 * 24));
      
      if (daysSince >= CONFIG.daysUntilFollowUp) {
        reminders.push({
          email: email,
          companyName: companyName,
          daysSince: daysSince
        });
      }
    }
  }
  
  // Send reminders (customize email template)
  reminders.forEach(reminder => {
    const subject = 'Follow-up: ' + reminder.companyName + ' Discovery Form';
    const body = 'Hi,\n\n' +
      'This is a reminder to follow up with ' + reminder.companyName + 
      ' (submitted ' + reminder.daysSince + ' days ago).\n\n' +
      'Email: ' + reminder.email + '\n\n' +
      'Please update the status in the tracking sheet.\n\n' +
      'Rocky Web Studio';
    
    // Uncomment to send emails
    // MailApp.sendEmail({
    //   to: 'team@rockywebstudio.com.au',
    //   subject: subject,
    //   body: body
    // });
    
    Logger.log('Reminder for: ' + reminder.companyName);
  });
  
  return reminders.length;
}

/**
 * Archive old records (older than 1 year)
 * Creates a new sheet called "Archived Leads"
 */
function archiveOldRecords() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(CONFIG.sheetName);
  if (!sheet) return;
  
  const archiveSheetName = 'Archived Leads';
  let archiveSheet = spreadsheet.getSheetByName(archiveSheetName);
  
  // Create archive sheet if it doesn't exist
  if (!archiveSheet) {
    archiveSheet = spreadsheet.insertSheet(archiveSheetName);
    // Copy headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();
    archiveSheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  }
  
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const archiveDate = new Date(today);
  archiveDate.setDate(archiveDate.getDate() - CONFIG.archiveAfterDays);
  
  const rowsToArchive = [];
  const rowsToDelete = [];
  
  // Find rows to archive (start from bottom to avoid index issues)
  for (let i = data.length - 1; i >= 1; i--) {
    const submittedDate = data[i][CONFIG.dateSubmittedColumn - 1];
    
    if (submittedDate instanceof Date && submittedDate < archiveDate) {
      rowsToArchive.push(data[i]);
      rowsToDelete.push(i + 1); // Sheet row number
    }
  }
  
  if (rowsToArchive.length > 0) {
    // Append to archive sheet
    const archiveRange = archiveSheet.getRange(
      archiveSheet.getLastRow() + 1,
      1,
      rowsToArchive.length,
      rowsToArchive[0].length
    );
    archiveRange.setValues(rowsToArchive);
    
    // Delete from main sheet (delete from bottom to top)
    rowsToDelete.reverse().forEach(rowNum => {
      sheet.deleteRow(rowNum);
    });
    
    Logger.log('Archived ' + rowsToArchive.length + ' records');
  }
}

/**
 * Generate weekly summary report
 * Sends email with key metrics
 */
function generateWeeklyReport() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  // Count metrics
  let newSubmissions = 0;
  let scheduledCalls = 0;
  let completedCalls = 0;
  let wonProjects = 0;
  let totalValue = 0;
  
  for (let i = 1; i < data.length; i++) {
    const submittedDate = data[i][CONFIG.dateSubmittedColumn - 1];
    const status = data[i][CONFIG.statusColumn - 1];
    const projectValue = data[i][12]; // Column M
    
    if (submittedDate instanceof Date && submittedDate >= weekAgo) {
      newSubmissions++;
      
      if (status === 'Scheduled') scheduledCalls++;
      if (status === 'Call Completed') completedCalls++;
      if (status === 'Won') {
        wonProjects++;
        if (projectValue) totalValue += parseFloat(projectValue) || 0;
      }
    }
  }
  
  // Create report
  const report = 'Weekly Discovery Form Report\n\n' +
    'Period: ' + weekAgo.toLocaleDateString() + ' to ' + today.toLocaleDateString() + '\n\n' +
    'New Submissions: ' + newSubmissions + '\n' +
    'Scheduled Calls: ' + scheduledCalls + '\n' +
    'Completed Calls: ' + completedCalls + '\n' +
    'Projects Won: ' + wonProjects + '\n' +
    'Total Value: $' + totalValue.toLocaleString() + '\n\n' +
    'View full report: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();
  
  Logger.log(report);
  
  // Uncomment to send email
  // MailApp.sendEmail({
  //   to: 'team@rockywebstudio.com.au',
  //   subject: 'Weekly Discovery Form Report',
  //   body: report
  // });
  
  return report;
}

/**
 * SET UP TRIGGERS
 * 
 * Run this function once to set up automatic triggers
 */
function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'updateStatusFromConsultation' ||
        trigger.getHandlerFunction() === 'sendFollowUpReminders' ||
        trigger.getHandlerFunction() === 'generateWeeklyReport') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new triggers
  
  // Daily: Update statuses
  ScriptApp.newTrigger('updateStatusFromConsultation')
    .timeBased()
    .everyDays(1)
    .atHour(9) // 9 AM
    .create();
  
  // Daily: Calculate days since submission
  ScriptApp.newTrigger('calculateDaysSinceSubmission')
    .timeBased()
    .everyDays(1)
    .atHour(10) // 10 AM
    .create();
  
  // Daily: Send follow-up reminders
  ScriptApp.newTrigger('sendFollowUpReminders')
    .timeBased()
    .everyDays(1)
    .atHour(11) // 11 AM
    .create();
  
  // Weekly: Generate report (Mondays at 9 AM)
  ScriptApp.newTrigger('generateWeeklyReport')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();
  
  // Monthly: Archive old records (1st of month at 2 AM)
  ScriptApp.newTrigger('archiveOldRecords')
    .timeBased()
    .onMonthDay(1)
    .atHour(2)
    .create();
  
  Logger.log('Triggers set up successfully!');
}

/**
 * Manual test function
 * Run this to test all functions
 */
function testAllFunctions() {
  Logger.log('Testing updateStatusFromConsultation...');
  updateStatusFromConsultation();
  
  Logger.log('Testing calculateDaysSinceSubmission...');
  calculateDaysSinceSubmission();
  
  Logger.log('Testing sendFollowUpReminders...');
  const reminders = sendFollowUpReminders();
  Logger.log('Found ' + reminders + ' reminders');
  
  Logger.log('Testing generateWeeklyReport...');
  const report = generateWeeklyReport();
  Logger.log(report);
  
  Logger.log('All tests completed!');
}





