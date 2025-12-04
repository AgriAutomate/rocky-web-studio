/**
 * Centralized email configuration
 * 
 * All email addresses used for sending emails via Resend.
 * Update these when adding new email addresses or changing domains.
 */

export const EMAIL_CONFIG = {
  /**
   * From addresses for different email types
   */
  from: {
    /**
     * Booking confirmations and appointment-related emails
     */
    bookings: "Rocky Web Studio <bookings@rockywebstudio.com.au>",
    
    /**
     * Custom song order confirmations
     */
    music: "Rocky Web Studio <music@rockywebstudio.com.au>",
    
    /**
     * Admin notifications and internal emails
     */
    notifications: "Rocky Web Studio <notifications@rockywebstudio.com.au>",
    
    /**
     * General inquiries and contact form responses
     */
    hello: "Rocky Web Studio <hello@rockywebstudio.com.au>",
  },

  /**
   * Reply-to addresses (where replies should go)
   */
  replyTo: {
    bookings: "bookings@rockywebstudio.com.au",
    music: "music@rockywebstudio.com.au",
    hello: "hello@rockywebstudio.com.au",
  },

  /**
   * Admin email address (for notifications)
   */
  admin: "hello@rockywebstudio.com.au",
} as const;

/**
 * Get from address for a given email type
 */
export function getFromAddress(type: keyof typeof EMAIL_CONFIG.from): string {
  return EMAIL_CONFIG.from[type];
}

/**
 * Get reply-to address for a given email type
 */
export function getReplyToAddress(type: keyof typeof EMAIL_CONFIG.replyTo): string {
  return EMAIL_CONFIG.replyTo[type];
}

