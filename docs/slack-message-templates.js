/**
 * Slack Message Templates for Discovery Workflow
 * Ready-to-use templates for n8n Code nodes
 */

// Template 1: New Form Submission
function newFormSubmission(data) {
  return `🎯 *New Discovery Form Submission*

*Company:* ${data.companyName}
*Contact:* ${data.contactName || 'Not provided'} | ${data.email}
*Industry:* ${data.industry} | *Size:* ${data.companySize}
*Budget Range:* ${data.budget}

*Main Goals:*
• ${data.mainProblem || 'Not specified'}
• ${data.successMetric || 'Not specified'}

*Key Features Requested:*
${data.features ? data.features.join(', ') : 'None specified'}

*AI Interests:* ${data.aiFeatures ? data.aiFeatures.join(', ') : 'None'}

*Timeline:* ${data.launchDate || 'Not specified'}

📋 *Full Details:* ${data.formLink || 'N/A'}
📅 *Schedule Consultation:* ${data.calendlyLink || 'https://calendly.com/rockywebstudio/consultation'}
📊 *View in Notion:* ${data.notionLink || 'N/A'}

---
*Submitted:* ${new Date(data.submittedAt).toLocaleString()} | *Status:* 🟡 Discovery`;
}

// Template 2: Consultation Scheduled
function consultationScheduled(data) {
  const consultationDate = new Date(data.consultationDate);
  return `📅 *Consultation Scheduled*

*Company:* ${data.companyName}
*Date & Time:* ${consultationDate.toLocaleDateString()} at ${consultationDate.toLocaleTimeString()} (${data.timezone || 'AEST'})
*Duration:* 30-45 minutes
*Attendees:* ${data.contactName} (${data.email})

*Project Summary:*
• Budget: ${data.budget}
• Features: ${data.features ? data.features.join(', ') : 'TBD'}
• Industry: ${data.industry}

🔗 *Zoom Link:* ${data.zoomLink || 'TBD'}
📋 *Project Details:* ${data.notionLink || 'N/A'}
📝 *Call Script:* https://docs.google.com/consultation-script

---
*Booked:* ${new Date().toLocaleString()} | *Reminder:* 24h before call`;
}

// Template 3: Consultation Reminder - 24 Hours
function consultationReminder24h(data) {
  const consultationDate = new Date(data.consultationDate);
  return `⏰ *Consultation Reminder - Tomorrow*

*Company:* ${data.companyName}
*Time:* Tomorrow at ${consultationDate.toLocaleTimeString()} (${data.timezone || 'AEST'})
*Duration:* 30-45 minutes

*Quick Prep:*
• Review discovery form: ${data.formLink || 'N/A'}
• Check project notes: ${data.notionLink || 'N/A'}
• Review call script: https://docs.google.com/consultation-script

*Key Points to Cover:*
• ${data.goal1 || 'Main goal'}
• ${data.goal2 || 'Secondary goal'}
• Budget: ${data.budget}
• Timeline: ${data.launchDate || 'TBD'}

🔗 *Zoom Link:* ${data.zoomLink || 'TBD'}

---
*Reminder sent:* ${new Date().toLocaleString()}`;
}

// Template 4: Consultation Reminder - Same Day
function consultationReminderSameDay(data) {
  const consultationDate = new Date(data.consultationDate);
  const now = new Date();
  const hoursUntil = Math.round((consultationDate - now) / (1000 * 60 * 60));
  
  return `🔔 *Consultation Starting Soon*

*Company:* ${data.companyName}
*Time:* ${consultationDate.toLocaleTimeString()} (${hoursUntil} hours)

*Quick Links:*
🔗 *Zoom:* ${data.zoomLink || 'TBD'}
📋 *Project:* ${data.notionLink || 'N/A'}
📝 *Script:* https://docs.google.com/consultation-script

*Don't forget:*
• Screen share ready
• Contract template ready
• Case studies prepared

---
*Starting in:* ${hoursUntil} hours`;
}

// Template 5: Consultation Completed
function consultationCompleted(data) {
  const outcomeEmoji = {
    'Won': '✅',
    'Needs Time': '🤔',
    'Lost': '❌',
    'Rescheduled': '📅'
  };
  
  const emoji = outcomeEmoji[data.outcome] || '✅';
  
  return `${emoji} *Consultation Completed*

*Company:* ${data.companyName}
*Date:* ${new Date(data.consultationDate).toLocaleDateString()}
*Duration:* ${data.callDuration || '30-45 minutes'}

*Outcome:* ${data.outcome}
*Next Steps:* ${data.nextSteps || 'TBD'}

*Key Decisions:*
• Package: ${data.packageName || 'TBD'} at $${data.price ? data.price.toLocaleString() : 'TBD'}
• Timeline: ${data.timeline || 'TBD'}
• Features: ${data.confirmedFeatures ? data.confirmedFeatures.join(', ') : 'TBD'}

*Action Items:*
${data.actionItems ? data.actionItems.map(item => `• ${item}`).join('\n') : '• TBD'}

📋 *Update Status:* ${data.notionLink || 'N/A'}
${data.contractLink ? `📄 *Contract Sent:* ${data.contractLink}` : ''}

---
*Completed:* ${new Date().toLocaleString()} | *Status:* ${data.newStatus || 'TBD'}`;
}

// Template 6: Project Won
function projectWon(data) {
  return `🎉 *NEW PROJECT WON!*

*Company:* ${data.companyName}
*Value:* $${data.projectValue.toLocaleString()}
*Package:* ${data.packageName}
*Timeline:* ${data.timeline}

*Key Features:*
${data.features.map(f => `• ${f}`).join('\n')}

*Team:*
• PM: ${data.projectManager || 'TBD'}
• Designer: ${data.designer || 'TBD'}
• Developer: ${data.developer || 'TBD'}

*Next Steps:*
• Design kickoff: ${new Date(data.kickoffDate).toLocaleDateString()}
• Launch target: ${new Date(data.launchDate).toLocaleDateString()}

📋 *Project Details:* ${data.notionLink || 'N/A'}

---
*Won:* ${new Date().toLocaleString()} | *Status:* 🟢 Design Phase`;
}

// Template 7: Follow-Up Needed
function followUpNeeded(data) {
  const daysSince = Math.floor((new Date() - new Date(data.lastContactDate)) / (1000 * 60 * 60 * 24));
  
  const priorityEmoji = {
    'High': '🔴',
    'Medium': '🟡',
    'Low': '🟢'
  };
  
  return `⚠️ *Follow-Up Needed*

*Company:* ${data.companyName}
*Contact:* ${data.contactName} | ${data.email}
*Last Contact:* ${new Date(data.lastContactDate).toLocaleDateString()} (${daysSince} days ago)
*Status:* ${data.status}

*Action Required:*
• Send follow-up email
• Schedule reminder call
• Update status if lost

📋 *Project:* ${data.notionLink || 'N/A'}
📧 *Email:* ${data.email}

---
*Alert:* ${new Date().toLocaleString()} | *Priority:* ${priorityEmoji[data.priority] || '🟡'} ${data.priority}`;
}

// Template 8: Deadline Alert
function deadlineAlert(data) {
  const deadlineDate = new Date(data.deadlineDate);
  const now = new Date();
  const daysUntil = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
  
  const urgencyEmoji = {
    'Critical': '🔴',
    'Warning': '🟡',
    'Info': '🟢'
  };
  
  return `🚨 *Deadline Alert*

*Project:* ${data.companyName}
*Deadline:* ${deadlineDate.toLocaleDateString()} (${daysUntil} days)
*Current Phase:* ${data.currentPhase}
*Status:* ${data.status}

*At Risk Items:*
${data.atRiskItems ? data.atRiskItems.map(item => `• ${item}`).join('\n') : '• None'}

*Action Required:*
${data.actionItems ? data.actionItems.map(item => `• ${item}`).join('\n') : '• Review project status'}

📋 *Project:* ${data.notionLink || 'N/A'}
👥 *Team:* @${data.projectManager || 'project-manager'}

---
*Alert:* ${new Date().toLocaleString()} | *Urgency:* ${urgencyEmoji[data.urgency] || '🟡'} ${data.urgency}`;
}

// Template 9: Daily Summary
function dailySummary(data) {
  return `📊 *Daily Summary - ${new Date().toLocaleDateString()}*

*New Submissions:* ${data.newSubmissions || 0}
*Consultations Scheduled:* ${data.consultationsScheduled || 0}
*Consultations Completed:* ${data.consultationsCompleted || 0}
*Projects Won:* ${data.projectsWon || 0}
*Total Pipeline Value:* $${(data.pipelineValue || 0).toLocaleString()}

*Today's Highlights:*
${data.highlights ? data.highlights.map(h => `• ${h}`).join('\n') : '• No highlights'}

*Tomorrow's Consultations:*
${data.tomorrowConsultations ? data.tomorrowConsultations.map(c => `• ${c.companyName} at ${new Date(c.time).toLocaleTimeString()}`).join('\n') : '• None scheduled'}

---
*Generated:* ${new Date().toLocaleString()}`;
}

// Template 10: Weekly Report
function weeklyReport(data) {
  return `📈 *Weekly Report - Week of ${new Date(data.weekStart).toLocaleDateString()}*

*This Week:*
• New Submissions: ${data.weeklySubmissions || 0}
• Consultations: ${data.weeklyConsultations || 0}
• Projects Won: ${data.weeklyWins || 0}
• Pipeline Value: $${(data.weeklyValue || 0).toLocaleString()}

*Conversion Rates:*
• Submissions → Consultations: ${data.conversionRate1 || 0}%
• Consultations → Wins: ${data.conversionRate2 || 0}%

*Top Industries:*
${data.topIndustries ? data.topIndustries.map(i => `• ${i.name}: ${i.count}`).join('\n') : '• No data'}

*Top Features Requested:*
${data.topFeatures ? data.topFeatures.map(f => `• ${f.name}: ${f.count}`).join('\n') : '• No data'}

*Goals for This Week:*
• ${data.goal1 || 'Maintain current pipeline'}
• ${data.goal2 || 'Improve conversion rates'}

---
*Report Generated:* ${new Date().toLocaleString()}`;
}

// Export for n8n use
// In n8n Code node, use like this:
// const message = newFormSubmission($input.item.json);
// return { message };


