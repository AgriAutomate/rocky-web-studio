import { render } from "@react-email/render";
import React from "react";
import { CustomerOrderConfirmation } from "./CustomerOrderConfirmation";
import { AdminOrderNotification } from "./AdminOrderNotification";

/**
 * Render React Email component to HTML string
 */
export function renderEmailTemplate(
  component: React.ReactElement
): string {
  return render(component);
}

export { CustomerOrderConfirmation, AdminOrderNotification };

