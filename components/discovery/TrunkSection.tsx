"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DiscoveryTrunk, IntegrationRequirement, SuccessMetric } from "@/lib/types/discovery";

interface TrunkSectionProps {
  trunk?: DiscoveryTrunk;
  onUpdate: (trunk: Partial<DiscoveryTrunk>) => void;
}

const INTEGRATION_OPTIONS = [
  { value: "email-marketing", label: "Email Marketing" },
  { value: "payment-processor", label: "Payment Processor" },
  { value: "booking", label: "Booking System" },
  { value: "inventory", label: "Inventory Management" },
  { value: "crm", label: "CRM" },
  { value: "accounting", label: "Accounting Software" },
  { value: "pos", label: "POS System" },
  { value: "custom-data-feeds", label: "Custom Data Feeds" },
  { value: "social-scheduling", label: "Social Media Scheduling" },
  { value: "other", label: "Other" },
];

const DATA_TYPES = [
  "customers",
  "products",
  "transactions",
  "inventory",
  "bookings",
  "other",
];

const DATA_VOLUME_OPTIONS = [
  { value: "small", label: "Small (< 1,000 records)" },
  { value: "medium", label: "Medium (1,000 - 10,000 records)" },
  { value: "large", label: "Large (> 10,000 records)" },
  { value: "unknown", label: "Unknown" },
];

const SUCCESS_METRIC_OPTIONS = [
  { value: "leads", label: "Increase Leads" },
  { value: "sales", label: "Increase Sales" },
  { value: "time-savings", label: "Time Savings" },
  { value: "support-reduction", label: "Reduce Support Load" },
  { value: "seo", label: "SEO Improvements" },
  { value: "performance", label: "Performance/Speed" },
  { value: "conversion", label: "Conversion Rate" },
  { value: "engagement", label: "User Engagement" },
];

export function TrunkSection({ trunk, onUpdate }: TrunkSectionProps) {
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(
    trunk?.integrations?.map((i) => i.systemName) || []
  );
  const [otherIntegration, setOtherIntegration] = useState("");
  const [hasDataMigration, setHasDataMigration] = useState(
    trunk?.dataMigration?.hasExistingData || false
  );

  const handleIntegrationChange = (value: string, checked: boolean) => {
    const updated = checked
      ? [...selectedIntegrations, value]
      : selectedIntegrations.filter((v) => v !== value);
    setSelectedIntegrations(updated);

    const integrations: IntegrationRequirement[] = updated.map((val) => {
      const existing = trunk?.integrations?.find((i) => i.systemName === val);
      if (existing) {
        return existing;
      }
      return {
        systemName: val,
        systemType: mapSystemType(val),
        integrationType: "unknown" as const,
        priority: "important" as const,
      };
    });

    onUpdate({ integrations });
  };

  const handleDataMigrationChange = (field: string, value: any) => {
    onUpdate({
      dataMigration: {
        ...trunk?.dataMigration,
        hasExistingData: hasDataMigration,
        [field]: value,
      },
    });
  };

  const handleSuccessMetricChange = (metricValue: string, checked: boolean) => {
    const current = trunk?.successMetrics || [];
    let updated: SuccessMetric[];

    if (checked) {
      const existing = current.find((m) => m.metric === metricValue);
      updated = existing
        ? current
        : [
            ...current,
            {
              metric: metricValue,
              priority: "important",
            },
          ];
    } else {
      updated = current.filter((m) => m.metric !== metricValue);
    }

    onUpdate({ successMetrics: updated });
  };

  const handleSuccessMetricTarget = (metricValue: string, target: string) => {
    const current = trunk?.successMetrics || [];
    const updated = current.map((m) =>
      m.metric === metricValue ? { ...m, target } : m
    );
    onUpdate({ successMetrics: updated });
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Universal Requirements</h2>
        <p className="text-muted-foreground text-sm">
          These questions apply to all projects regardless of your sector.
        </p>
      </div>

      {/* Integrations */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          What systems need to integrate?
        </Label>
        <p className="text-sm text-muted-foreground">
          Select all systems that need to connect with your new solution.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {INTEGRATION_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIntegrations.includes(option.value)}
                onChange={(e) =>
                  handleIntegrationChange(option.value, e.target.checked)
                }
                className="size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
        {selectedIntegrations.includes("other") && (
          <Input
            placeholder="Please specify other integration needs"
            value={otherIntegration}
            onChange={(e) => {
              setOtherIntegration(e.target.value);
              // Update the "other" integration with custom name
              const integrations = trunk?.integrations || [];
              const otherIdx = integrations.findIndex(
                (i) => i.systemName === "other"
              );
      if (otherIdx >= 0 && e.target.value) {
        const updated = [...integrations];
        const existing = updated[otherIdx];
        if (existing) {
          updated[otherIdx] = {
            ...existing,
            systemName: e.target.value,
          };
          onUpdate({ integrations: updated });
        }
      }
            }}
          />
        )}
      </div>

      {/* Data Migration */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Do you have existing data to migrate?
        </Label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="dataMigration"
              checked={hasDataMigration === true}
              onChange={() => {
                setHasDataMigration(true);
                handleDataMigrationChange("hasExistingData", true);
              }}
              className="size-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="dataMigration"
              checked={hasDataMigration === false}
              onChange={() => {
                setHasDataMigration(false);
                handleDataMigrationChange("hasExistingData", false);
              }}
              className="size-4"
            />
            <span>No</span>
          </label>
        </div>

        {hasDataMigration && (
          <div className="space-y-4 pl-6 border-l-2">
            <div>
              <Label className="text-sm">Types of data to migrate</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {DATA_TYPES.map((type) => (
                  <label
                    key={type}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        trunk?.dataMigration?.dataTypes?.includes(type) ||
                        false
                      }
                      onChange={(e) => {
                        const current = trunk?.dataMigration?.dataTypes || [];
                        const updated = e.target.checked
                          ? [...current, type]
                          : current.filter((t) => t !== type);
                        handleDataMigrationChange("dataTypes", updated);
                      }}
                      className="size-4"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm">Estimated data volume</Label>
              <select
                value={trunk?.dataMigration?.dataVolume || ""}
                onChange={(e) =>
                  handleDataMigrationChange("dataVolume", e.target.value)
                }
                className="w-full mt-2 p-2 border rounded-md"
              >
                <option value="">Select volume...</option>
                {DATA_VOLUME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm">Current system (if applicable)</Label>
              <Input
                value={trunk?.dataMigration?.currentSystem || ""}
                onChange={(e) =>
                  handleDataMigrationChange("currentSystem", e.target.value)
                }
                placeholder="e.g., Shopify, Excel, Custom database"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm">Additional notes</Label>
              <Textarea
                value={trunk?.dataMigration?.notes || ""}
                onChange={(e) =>
                  handleDataMigrationChange("notes", e.target.value)
                }
                placeholder="Any specific requirements or concerns about data migration"
                rows={3}
                className="mt-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Success Metrics */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          How will you measure success?
        </Label>
        <p className="text-sm text-muted-foreground">
          Select metrics that matter most to your business.
        </p>
        <div className="space-y-3">
          {SUCCESS_METRIC_OPTIONS.map((option) => {
            const isSelected = trunk?.successMetrics?.some(
              (m) => m.metric === option.value
            );
            const metric = trunk?.successMetrics?.find(
              (m) => m.metric === option.value
            );

            return (
              <div key={option.value} className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected || false}
                    onChange={(e) =>
                      handleSuccessMetricChange(option.value, e.target.checked)
                    }
                    className="size-4"
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
                {isSelected && (
                  <Input
                    placeholder="Target (e.g., '30%', '100 leads/month')"
                    value={metric?.target || ""}
                    onChange={(e) =>
                      handleSuccessMetricTarget(option.value, e.target.value)
                    }
                    className="ml-6 max-w-xs"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// Helper function to map integration option to system type
function mapSystemType(value: string): IntegrationRequirement["systemType"] {
  const mapping: Record<string, IntegrationRequirement["systemType"]> = {
    "email-marketing": "crm",
    "payment-processor": "payment",
    booking: "booking",
    inventory: "inventory",
    crm: "crm",
    accounting: "accounting",
    pos: "pos",
    "custom-data-feeds": "other",
    "social-scheduling": "other",
    other: "other",
  };
  return mapping[value] || "other";
}
