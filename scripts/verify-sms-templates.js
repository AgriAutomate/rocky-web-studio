/**
 * Verify SMS templates character counts and formatting
 * 
 * Usage: node scripts/verify-sms-templates.js
 */

// Mock the template functions for verification
// In real usage, these would be imported from lib/sms/messages.ts

function formatDateShort(date) {
  const [, month, day] = date.split("-").map(Number);
  if (!day || !month) return date;
  return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}`;
}

function formatTimeShort(time) {
  return time.substring(0, 5); // HH:mm
}

function shortenServiceName(serviceType) {
  const shortNames = {
    "Website Consultation (1 hour)": "Website Consult",
    "Website Audit (30 min)": "Website Audit",
    "Follow-up Meeting (30 min)": "Follow-up",
  };
  return shortNames[serviceType] || serviceType.substring(0, 20);
}

// Test data
const testOptions = {
  name: "John Doe",
  serviceType: "Website Consultation (1 hour)",
  date: "2025-12-15",
  time: "14:00",
  bookingId: "BK1234567890",
};

const testBooking = {
  service: "Website Consultation (1 hour)",
  time: "14:00",
};

console.log("📱 SMS Template Verification\n");
console.log("=".repeat(60));

// 1. Confirmation Messages
console.log("\n1. CONFIRMATION MESSAGES\n");

// Current template
const shortService = shortenServiceName(testOptions.serviceType);
const shortDate = formatDateShort(testOptions.date);
const shortTime = formatTimeShort(testOptions.time);
const confirmationCurrent = `Hi ${testOptions.name}! Confirmed: ${shortService} on ${shortDate} at ${shortTime}. ID: ${testOptions.bookingId}. Reply with questions - Rocky Web Studio`;

// Required template format
const confirmationRequired = `Your booking confirmed: ${shortDate} ${shortTime}. Reply CANCEL to cancel.`;

console.log("Current Confirmation Template:");
console.log(`  Message: ${confirmationCurrent}`);
console.log(`  Length: ${confirmationCurrent.length} chars`);
console.log(`  Valid: ${confirmationCurrent.length <= 160 ? "✅" : "❌"}`);

console.log("\nRequired Confirmation Template:");
console.log(`  Message: ${confirmationRequired}`);
console.log(`  Length: ${confirmationRequired.length} chars`);
console.log(`  Valid: ${confirmationRequired.length <= 160 ? "✅" : "❌"}`);

// 2. Reminder Messages
console.log("\n\n2. REMINDER MESSAGES\n");

// Current template
const reminderCurrent = `Reminder: Your Rocky Web Studio ${shortService} is tomorrow at ${shortTime}. Reply CONFIRM or RESCHEDULE`;

// Required template format
const reminderRequired = `Reminder: Your booking is tomorrow at ${shortTime}. See you then!`;

console.log("Current Reminder Template:");
console.log(`  Message: ${reminderCurrent}`);
console.log(`  Length: ${reminderCurrent.length} chars`);
console.log(`  Valid: ${reminderCurrent.length <= 160 ? "✅" : "❌"}`);

console.log("\nRequired Reminder Template:");
console.log(`  Message: ${reminderRequired}`);
console.log(`  Length: ${reminderRequired.length} chars`);
console.log(`  Valid: ${reminderRequired.length <= 160 ? "✅" : "❌"}`);

// 3. Admin Notification
console.log("\n\n3. ADMIN NOTIFICATION\n");

const adminRequired = `${testOptions.name} booked ${shortService} on ${shortDate}. Reply to respond.`;

console.log("Required Admin Template:");
console.log(`  Message: ${adminRequired}`);
console.log(`  Length: ${adminRequired.length} chars`);
console.log(`  Valid: ${adminRequired.length <= 160 ? "✅" : "❌"}`);

// 4. Summary
console.log("\n\n4. SUMMARY\n");
console.log("=".repeat(60));

const templates = [
  { name: "Confirmation (Current)", message: confirmationCurrent },
  { name: "Confirmation (Required)", message: confirmationRequired },
  { name: "Reminder (Current)", message: reminderCurrent },
  { name: "Reminder (Required)", message: reminderRequired },
  { name: "Admin (Required)", message: adminRequired },
];

console.log("\nTemplate Comparison:\n");
templates.forEach((t) => {
  const valid = t.message.length <= 160;
  const status = valid ? "✅" : "❌";
  console.log(
    `${status} ${t.name.padEnd(30)} ${t.message.length.toString().padStart(3)} chars`
  );
});

console.log("\n" + "=".repeat(60));
console.log("\n✅ Verification complete!\n");
console.log("NOTE: Current templates are more detailed but functional.");
console.log("Required templates are simpler and match specification.\n");

