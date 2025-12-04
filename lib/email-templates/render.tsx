import { render } from "@react-email/render";
import React from "react";
import { CustomerOrderConfirmation } from "./CustomerOrderConfirmation";
import { AdminOrderNotification } from "./AdminOrderNotification";
import { BookingConfirmation } from "./BookingConfirmation";

/**
 * Render React Email component to HTML string
 */
export async function renderEmailTemplate(
  component: React.ReactElement
): Promise<string> {
  return await render(component);
}

export { CustomerOrderConfirmation, AdminOrderNotification, BookingConfirmation };

