/**
 * Capacity Dashboard Component
 * 
 * Displays real-time capacity monitoring for all services.
 * Requires admin authentication.
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

interface ServiceCapacity {
  service: string;
  resource: string;
  limit: number;
  currentUsage: number;
  utilizationPercent: number;
  status: "safe" | "warning" | "critical" | "over-capacity";
  alertLevel: "none" | "info" | "warning" | "critical" | "emergency";
}

interface PerplexityStats {
  date: string;
  totalSearches: number;
  remainingSearches: number;
  utilizationPercent: number;
  status: "safe" | "warning" | "critical" | "emergency" | "exceeded";
}

interface CapacityData {
  success: boolean;
  timestamp: string;
  capacity: {
    overallStatus: "healthy" | "warning" | "critical" | "over-capacity";
    services: ServiceCapacity[];
    criticalAlerts: string[];
    recommendations: string[];
  };
  perplexity: {
    today: PerplexityStats;
    history: PerplexityStats[];
  };
  alerts: {
    needsAttention: boolean;
    criticalAlerts: string[];
  };
}

export function CapacityDashboard() {
  const [data, setData] = useState<CapacityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCapacityData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchCapacityData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchCapacityData() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/capacity");
      if (!response.ok) {
        throw new Error("Failed to fetch capacity data");
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "safe":
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "over-capacity":
      case "exceeded":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      safe: "default",
      healthy: "default",
      warning: "secondary",
      critical: "destructive",
      "over-capacity": "destructive",
      exceeded: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  }

  function getProgressColor(percent: number) {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 75) return "bg-orange-500";
    if (percent >= 50) return "bg-yellow-500";
    return "bg-green-500";
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading capacity data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Capacity Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(data.capacity.overallStatus)}
          {getStatusBadge(data.capacity.overallStatus)}
        </div>
      </div>

      {/* Critical Alerts */}
      {data.alerts.needsAttention && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2">
              {data.alerts.criticalAlerts.map((alert, i) => (
                <li key={i}>{alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Perplexity Critical Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Perplexity PRO - Daily Usage
            {getStatusIcon(data.perplexity.today.status)}
          </CardTitle>
          <CardDescription>
            Hard limit: 300 searches/day (resets daily at midnight UTC)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Today: {data.perplexity.today.totalSearches} / 300 searches
                </span>
                <span className="text-sm font-medium">
                  {data.perplexity.today.utilizationPercent.toFixed(1)}% utilized
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${getProgressColor(
                    data.perplexity.today.utilizationPercent
                  )}`}
                  style={{ width: `${Math.min(data.perplexity.today.utilizationPercent, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Remaining: {data.perplexity.today.remainingSearches} searches today
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Capacities */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.capacity.services.map((service, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{service.service}</CardTitle>
              <CardDescription>{service.resource}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Usage</span>
                  <span className="font-medium">
                    {service.currentUsage.toFixed(2)} / {service.limit} {service.resource.includes("GB") ? "GB" : service.resource.includes("MB") ? "MB" : ""}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getProgressColor(service.utilizationPercent)}`}
                    style={{ width: `${Math.min(service.utilizationPercent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {service.utilizationPercent.toFixed(1)}% utilized
                  </span>
                  {getStatusBadge(service.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {data.capacity.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {data.capacity.recommendations.map((rec, i) => (
                <li key={i} className="text-sm">{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

