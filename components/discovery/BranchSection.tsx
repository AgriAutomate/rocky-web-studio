"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  HospitalityBranch,
  RetailBranch,
  TradesBranch,
  ProfessionalServicesBranch,
} from "@/lib/types/discovery";
import type { Sector } from "@/lib/types/questionnaire";

interface BranchSectionProps {
  sector: Sector;
  branchData?: any;
  onUpdate: (data: any) => void;
}

export function BranchSection({
  sector,
  branchData,
  onUpdate,
}: BranchSectionProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...branchData, [field]: value });
  };

  switch (sector) {
    case "hospitality":
      return (
        <HospitalityBranchUI
          data={branchData as HospitalityBranch}
          onChange={handleChange}
        />
      );
    case "retail":
      return (
        <RetailBranchUI
          data={branchData as RetailBranch}
          onChange={handleChange}
        />
      );
    case "construction":
      return (
        <TradesBranchUI
          data={branchData as TradesBranch}
          onChange={handleChange}
        />
      );
    case "professional-services":
      return (
        <ProfessionalServicesBranchUI
          data={branchData as ProfessionalServicesBranch}
          onChange={handleChange}
        />
      );
    default:
      return null;
  }
}

// Hospitality Branch UI
function HospitalityBranchUI({
  data,
  onChange,
}: {
  data?: HospitalityBranch;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Hospitality-Specific Details</h2>
        <p className="text-muted-foreground text-sm">
          Tell us about your hospitality operations.
        </p>
      </div>

      <div>
        <Label className="text-base font-semibold">Booking Model</Label>
        <div className="flex gap-4 mt-2">
          {["table", "rooms", "events", "mixed"].map((option) => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="bookingModel"
                value={option}
                checked={data?.bookingModel === option}
                onChange={(e) => onChange("bookingModel", e.target.value)}
                className="size-4"
              />
              <span className="text-sm capitalize">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Booking Channels</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { value: "walkins", label: "Walk-ins" },
            { value: "phone", label: "Phone" },
            { value: "online", label: "Online Bookings" },
            { value: "ota", label: "OTA (Airbnb/Booking.com)" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer"
            >
              <input
                type="checkbox"
                checked={data?.channels?.includes(option.value as any) || false}
                onChange={(e) => {
                  const current = data?.channels || [];
                  const updated = e.target.checked
                    ? [...current, option.value]
                    : current.filter((c) => c !== option.value);
                  onChange("channels", updated);
                }}
                className="size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Service Flow / Table Turns</Label>
        <Textarea
          value={data?.serviceFlow || ""}
          onChange={(e) => onChange("serviceFlow", e.target.value)}
          placeholder="Describe your service flow, average table turns, peak times, etc."
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Current POS / PMS Stack</Label>
        <Textarea
          value={data?.posPmsStack || ""}
          onChange={(e) => onChange("posPmsStack", e.target.value)}
          placeholder="What POS or property management systems are you currently using?"
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Menu or Inventory Complexity</Label>
        <Textarea
          value={data?.menuInventoryComplexity || ""}
          onChange={(e) => onChange("menuInventoryComplexity", e.target.value)}
          placeholder="Describe your menu items, inventory management, pricing complexity, etc."
          rows={3}
          className="mt-2"
        />
      </div>
    </Card>
  );
}

// Retail Branch UI
function RetailBranchUI({
  data,
  onChange,
}: {
  data?: RetailBranch;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Retail-Specific Details</h2>
        <p className="text-muted-foreground text-sm">
          Tell us about your retail operations.
        </p>
      </div>

      <div>
        <Label className="text-base font-semibold">Sales Mix</Label>
        <div className="flex gap-4 mt-2">
          {[
            { value: "in-store", label: "In-Store Primary" },
            { value: "online", label: "Online Primary" },
            { value: "hybrid", label: "Hybrid" },
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="salesMix"
                value={option.value}
                checked={data?.salesMix === option.value}
                onChange={(e) => onChange("salesMix", e.target.value)}
                className="size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Sales Channels</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { value: "shopify", label: "Shopify" },
            { value: "pos", label: "POS System" },
            { value: "marketplaces", label: "Marketplaces" },
            { value: "social", label: "Social Commerce" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer"
            >
              <input
                type="checkbox"
                checked={data?.channels?.includes(option.value as any) || false}
                onChange={(e) => {
                  const current = data?.channels || [];
                  const updated = e.target.checked
                    ? [...current, option.value]
                    : current.filter((c) => c !== option.value);
                  onChange("channels", updated);
                }}
                className="size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Inventory Complexity</Label>
        <Textarea
          value={data?.inventoryComplexity || ""}
          onChange={(e) => onChange("inventoryComplexity", e.target.value)}
          placeholder="Number of SKUs, variants, product types, inventory management approach"
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Fulfillment Operations</Label>
        <Textarea
          value={data?.fulfillmentOps || ""}
          onChange={(e) => onChange("fulfillmentOps", e.target.value)}
          placeholder="3PL, in-house fulfillment, shipping partners, etc."
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Loyalty / CRM Setup</Label>
        <Textarea
          value={data?.loyaltyCrmSetup || ""}
          onChange={(e) => onChange("loyaltyCrmSetup", e.target.value)}
          placeholder="Current loyalty programs, customer data management, CRM usage"
          rows={3}
          className="mt-2"
        />
      </div>
    </Card>
  );
}

// Trades Branch UI
function TradesBranchUI({
  data,
  onChange,
}: {
  data?: TradesBranch;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Trades & Construction Details</h2>
        <p className="text-muted-foreground text-sm">
          Tell us about your trades/construction operations.
        </p>
      </div>

      <div>
        <Label className="text-base font-semibold">Job Scheduling Pattern</Label>
        <div className="flex gap-4 mt-2">
          {[
            { value: "emergency", label: "Emergency / Same-Day" },
            { value: "planned", label: "Planned Jobs" },
            { value: "projects", label: "Long-Running Projects" },
            { value: "mixed", label: "Mixed" },
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="jobSchedulingPattern"
                value={option.value}
                checked={data?.jobSchedulingPattern === option.value}
                onChange={(e) => onChange("jobSchedulingPattern", e.target.value)}
                className="size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Quote/Estimate Workflow</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { value: "onsite", label: "Onsite Quoting" },
            { value: "remote", label: "Remote Quoting" },
            { value: "template", label: "Template-Based" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer"
            >
              <input
                type="checkbox"
                checked={data?.quoteWorkflow?.includes(option.value as any) || false}
                onChange={(e) => {
                  const current = data?.quoteWorkflow || [];
                  const updated = e.target.checked
                    ? [...current, option.value]
                    : current.filter((w) => w !== option.value);
                  onChange("quoteWorkflow", updated);
                }}
                className="size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Dispatch / Routing Tools</Label>
        <Textarea
          value={data?.dispatchRoutingTools || ""}
          onChange={(e) => onChange("dispatchRoutingTools", e.target.value)}
          placeholder="What tools do you use for dispatch, routing, or job assignment?"
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Job Tracking or Compliance Needs</Label>
        <Textarea
          value={data?.jobTrackingCompliance || ""}
          onChange={(e) => onChange("jobTrackingCompliance", e.target.value)}
          placeholder="Compliance requirements, certification tracking, job documentation needs"
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Billing and Payments Process</Label>
        <Textarea
          value={data?.billingPaymentsProcess || ""}
          onChange={(e) => onChange("billingPaymentsProcess", e.target.value)}
          placeholder="How do you currently handle invoicing, payments, and billing?"
          rows={3}
          className="mt-2"
        />
      </div>
    </Card>
  );
}

// Professional Services Branch UI
function ProfessionalServicesBranchUI({
  data,
  onChange,
}: {
  data?: ProfessionalServicesBranch;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Professional Services Details</h2>
        <p className="text-muted-foreground text-sm">
          Tell us about your professional services operations.
        </p>
      </div>

      <div>
        <Label className="text-base font-semibold">Engagement Model</Label>
        <div className="flex gap-4 mt-2">
          {[
            { value: "retainer", label: "Retainer" },
            { value: "project", label: "Project-Based" },
            { value: "mixed", label: "Mixed" },
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="engagementModel"
                value={option.value}
                checked={data?.engagementModel === option.value}
                onChange={(e) => onChange("engagementModel", e.target.value)}
                className="size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Sales Motions</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { value: "inbound", label: "Inbound" },
            { value: "outbound", label: "Outbound" },
            { value: "referrals", label: "Referrals/Partners" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer"
            >
              <input
                type="checkbox"
                checked={data?.salesMotions?.includes(option.value as any) || false}
                onChange={(e) => {
                  const current = data?.salesMotions || [];
                  const updated = e.target.checked
                    ? [...current, option.value]
                    : current.filter((m) => m !== option.value);
                  onChange("salesMotions", updated);
                }}
                className="size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Proposal / SOW Process</Label>
        <Textarea
          value={data?.proposalSowProcess || ""}
          onChange={(e) => onChange("proposalSowProcess", e.target.value)}
          placeholder="How do you currently create and manage proposals or statements of work?"
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Delivery Tooling (PM/QA)</Label>
        <Textarea
          value={data?.deliveryTooling || ""}
          onChange={(e) => onChange("deliveryTooling", e.target.value)}
          placeholder="What project management or quality assurance tools do you use?"
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Reporting / Client Portals</Label>
        <Textarea
          value={data?.reportingClientPortals || ""}
          onChange={(e) => onChange("reportingClientPortals", e.target.value)}
          placeholder="Do you need client portals, reporting dashboards, or status updates?"
          rows={3}
          className="mt-2"
        />
      </div>
    </Card>
  );
}
