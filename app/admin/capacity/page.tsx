/**
 * Admin Capacity Monitoring Page
 * 
 * Displays real-time capacity monitoring dashboard.
 * Requires admin authentication.
 */

import { CapacityDashboard } from "@/components/admin/CapacityDashboard";

export default function CapacityPage() {
  return (
    <div className="container mx-auto py-6">
      <CapacityDashboard />
    </div>
  );
}

export const metadata = {
  title: "Capacity Monitoring | Admin",
  description: "Real-time capacity monitoring for all services",
};

