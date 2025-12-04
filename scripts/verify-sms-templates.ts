#!/usr/bin/env ts-node
/**
 * Verify SMS templates character counts and formatting
 * 
 * Usage: npm run verify-sms-templates
 * or: npx ts-node scripts/verify-sms-templates.ts
 */

import {
  generateConfirmationMessage,
  generateServiceSpecificMessage,
  generate24HourReminder,
  generate2HourReminder,
  validateMessageLength,
  getServiceSpecificInfo,
} from "../lib/sms/messages";
import type { Booking } from "../lib/bookings/storage";

// Test data
const testBooking: Booking = {
  id: "test-123",
  bookingId: "BK1234567890",
  customerName: "John Doe",
  email: "john@example.com",
  phone: "+61400000000",
  service: "Website Consultation (1 hour)",
  date: "2025-12-15",
  time: "14:00",
  status: "confirmed",
  history: [
    {
      timestamp: new Date(),
      action: "created",
      changedBy: "user",
      details: {},
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
  smsOptIn: true,
  reminderSent24h: false,
  reminderSent2h: false,
};

const testOptions = {
  name: "John Doe",
  serviceType: "Website Consultation (1 hour)",
  date: "2025-12-15",
  time: "14:00",
  bookingId: "BK1234567890",
  isVideoCall: true,
  location: "Rocky Web Studio HQ",
};

console.log("📱 SMS Template Verification\n");
console.log("=" .repeat(60));

// 1. Confirmation Messages
console.log("\n1. CONFIRMATION MESSAGES\n");

const confirmationStandard = generateConfirmationMessage(testOptions);
const confirmationValidation = validateMessageLength(confirmationStandard);

console.log("Standard Confirmation:");
console.log(`  Message: ${confirmationStandard}`);
console.log(`  Length: ${confirmationValidation.length} chars`);
console.log(`  Parts: ${confirmationValidation.parts}`);
console.log(`  Valid: ${confirmationValidation.valid ? "✅" : "❌"}`);
if (confirmationValidation.warning) {
  console.log(`  ⚠️  ${confirmationValidation.warning}`);
}

// Service-specific confirmations
const services = [
  "Website Consultation (1 hour)",
  "Website Audit (30 min)",
  "Follow-up Meeting (30 min)",
];

for (const service of services) {
  const serviceInfo = getServiceSpecificInfo(service);
  const serviceMessage = generateServiceSpecificMessage({
    ...testOptions,
    serviceType: service,
    isVideoCall: serviceInfo.isVideoCall,
    location: serviceInfo.location,
  });
  const serviceValidation = validateMessageLength(serviceMessage);

  console.log(`\n${service}:`);
  console.log(`  Message: ${serviceMessage}`);
  console.log(`  Length: ${serviceValidation.length} chars`);
  console.log(`  Parts: ${serviceValidation.parts}`);
  console.log(`  Valid: ${serviceValidation.valid ? "✅" : "❌"}`);
  if (serviceValidation.warning) {
    console.log(`  ⚠️  ${serviceValidation.warning}`);
  }
}

// 2. Reminder Messages
console.log("\n\n2. REMINDER MESSAGES\n");

const reminder24h = generate24HourReminder(testBooking);
const reminder24hValidation = validateMessageLength(reminder24h);

console.log("24-Hour Reminder:");
console.log(`  Message: ${reminder24h}`);
console.log(`  Length: ${reminder24hValidation.length} chars`);
console.log(`  Parts: ${reminder24hValidation.parts}`);
console.log(`  Valid: ${reminder24hValidation.valid ? "✅" : "❌"}`);
if (reminder24hValidation.warning) {
  console.log(`  ⚠️  ${reminder24hValidation.warning}`);
}

const reminder2h = generate2HourReminder(testBooking);
const reminder2hValidation = validateMessageLength(reminder2h);

console.log("\n2-Hour Reminder:");
console.log(`  Message: ${reminder2h}`);
console.log(`  Length: ${reminder2hValidation.length} chars`);
console.log(`  Parts: ${reminder2hValidation.parts}`);
console.log(`  Valid: ${reminder2hValidation.valid ? "✅" : "❌"}`);
if (reminder2hValidation.warning) {
  console.log(`  ⚠️  ${reminder2hValidation.warning}`);
}

// 3. Summary
console.log("\n\n3. SUMMARY\n");
console.log("=" .repeat(60));

const allMessages = [
  { name: "Confirmation (Standard)", message: confirmationStandard },
  ...services.map((service) => {
    const serviceInfo = getServiceSpecificInfo(service);
    return {
      name: `Confirmation (${service})`,
      message: generateServiceSpecificMessage({
        ...testOptions,
        serviceType: service,
        isVideoCall: serviceInfo.isVideoCall,
        location: serviceInfo.location,
      }),
    };
  }),
  { name: "24-Hour Reminder", message: reminder24h },
  { name: "2-Hour Reminder", message: reminder2h },
];

const allValid = allMessages.every((m) =>
  validateMessageLength(m.message).valid
);

console.log(`\nAll templates under 160 chars: ${allValid ? "✅" : "❌"}\n`);

allMessages.forEach((m) => {
  const validation = validateMessageLength(m.message);
  const status = validation.valid ? "✅" : "❌";
  console.log(
    `${status} ${m.name.padEnd(35)} ${validation.length.toString().padStart(3)} chars (${validation.parts} part${validation.parts > 1 ? "s" : ""})`
  );
});

console.log("\n" + "=".repeat(60));
console.log("\n✅ Verification complete!\n");

