"use client";

import { useState, useEffect } from "react";
import { FileText, Download, ExternalLink, Plus } from "lucide-react";
import { XeroConnectionStatus } from "@/components/admin/XeroConnectionStatus";
import { CreateInvoiceDialog } from "@/components/admin/CreateInvoiceDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  invoiceID: string;
  invoiceNumber?: string;
  status?: string;
  total?: number;
  amountDue?: number;
  date?: string;
  dueDate?: string;
  contact?: {
    name?: string;
    emailAddress?: string;
  };
}

export default function AdminSettingsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [tenantId, setTenantId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get status to retrieve tenant ID
        const statusResponse = await fetch("/api/xero/status");
        const statusData = await statusResponse.json();
        
        if (statusData.connected && statusData.tenantId) {
          setTenantId(statusData.tenantId);
          
          // Fetch invoices
          const invoicesResponse = await fetch("/api/xero/invoices?order=Date DESC");
          const invoicesData = await invoicesResponse.json();
          
          if (invoicesData.success && invoicesData.invoices) {
            setInvoices(invoicesData.invoices.slice(0, 10)); // Show last 10
          }
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [createDialogOpen]); // Refetch when dialog closes (new invoice created)

  const handleViewInXero = (_tenantId: string, invoiceId: string) => {
    window.open(
      `https://go.xero.com/AccountsReceivable/View.aspx?invoiceID=${invoiceId}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/xero/invoices/${invoiceId}?pdf=true`);
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "AUTHORISED":
      case "PAID":
        return <Badge variant="default">Paid</Badge>;
      case "SUBMITTED":
        return <Badge variant="secondary">Submitted</Badge>;
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "$0.00";
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your integrations and settings
        </p>
      </div>

      {/* Xero Integration Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Xero Integration</h2>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        <XeroConnectionStatus />

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>
              View and manage your recent Xero invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading invoices...
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No invoices found</p>
                <p className="text-sm mt-2">
                  Create your first invoice to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.invoiceID}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">
                            {invoice.invoiceNumber || invoice.invoiceID}
                          </div>
                          {invoice.contact?.name && (
                            <div className="text-sm text-muted-foreground">
                              {invoice.contact.name}
                            </div>
                          )}
                        </div>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Due: {formatDate(invoice.dueDate)}</span>
                        <span>Total: {formatCurrency(invoice.total)}</span>
                        {invoice.amountDue !== undefined && invoice.amountDue > 0 && (
                          <span className="text-orange-600 font-medium">
                            Due: {formatCurrency(invoice.amountDue)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadPDF(invoice.invoiceID)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (tenantId) {
                            handleViewInXero(tenantId, invoice.invoiceID);
                          } else {
                            alert("Xero not connected");
                          }
                        }}
                        title="View in Xero"
                        disabled={!tenantId}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

