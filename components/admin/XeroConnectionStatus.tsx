"use client";

import { useEffect, useState } from "react";
import { Link2, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface XeroStatus {
  connected: boolean;
  organizationName?: string;
  tenantId?: string;
  lastSync?: string;
}

export function XeroConnectionStatus() {
  const [status, setStatus] = useState<XeroStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/xero/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch Xero status:", error);
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Xero? This will remove all stored credentials.")) {
      return;
    }

    try {
      setDisconnecting(true);
      const response = await fetch("/api/xero/disconnect", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        await fetchStatus();
      } else {
        alert(`Failed to disconnect: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to disconnect Xero:", error);
      alert("Failed to disconnect Xero. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Xero Integration</CardTitle>
          <CardDescription>Checking connection status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Xero Integration</CardTitle>
            <CardDescription>
              Manage your Xero accounting integration
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchStatus}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status?.connected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Connected</div>
                  {status.organizationName && (
                    <div className="text-sm text-muted-foreground">
                      {status.organizationName}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium">Not Connected</div>
                  <div className="text-sm text-muted-foreground">
                    Connect your Xero account to manage invoices
                  </div>
                </div>
              </>
            )}
          </div>
          <Badge variant={status?.connected ? "default" : "outline"}>
            {status?.connected ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Connection Details */}
        {status?.connected && (
          <div className="space-y-2 rounded-lg border bg-muted/50 p-4 text-sm">
            {status.tenantId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenant ID:</span>
                <span className="font-mono text-xs">{status.tenantId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Sync:</span>
              <span>{formatDate(status.lastSync)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {status?.connected ? (
            <>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  "Disconnect"
                )}
              </Button>
              <Button
                variant="outline"
                asChild
              >
                <a
                  href={`https://go.xero.com/Organisation/View.aspx?organisationId=${status.tenantId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Open in Xero
                </a>
              </Button>
            </>
          ) : (
            <Button asChild>
              <a href="/api/xero/connect">
                <Link2 className="mr-2 h-4 w-4" />
                Connect Xero
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


