import { parsePhoneNumber } from "libphonenumber-js";

/**
 * Validate Australian phone number
 * @param phone - Phone number string (any format)
 * @returns true if valid Australian phone number
 */
export function validateAustralianPhone(phone: string): boolean {
  try {
    const phoneNumber = parsePhoneNumber(phone, "AU");
    return phoneNumber.isValid() && phoneNumber.country === "AU";
  } catch {
    return false;
  }
}

/**
 * Format phone number to E.164 format (e.g., +61412345678)
 * @param phone - Phone number string (any format)
 * @returns E.164 formatted phone number
 */
export function formatToE164(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumber(phone, "AU");
    return phoneNumber.format("E.164"); // Returns: +61412345678
  } catch (error) {
    // If parsing fails, return original (will be caught by validation)
    return phone;
  }
}

/**
 * Format phone number for display (e.g., +61 4 1234 5678)
 * @param phone - Phone number string (any format)
 * @returns Formatted phone number for display
 */
export function formatForDisplay(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumber(phone, "AU");
    return phoneNumber.formatInternational(); // Returns: +61 4 1234 5678
  } catch {
    return phone;
  }
}

