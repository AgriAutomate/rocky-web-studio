"use client";

/**
 * Admin SMS Logs Dashboard
 * 
 * ⚠️ AUTHENTICATION REQUIRED:
 * This page should be protected with authentication middleware.
 * 
 * TODO: Implement authentication:
 * 1. Add next-auth or similar authentication library
 * 2. Create middleware.ts at root level to protect /admin routes
 * 3. Require admin role for access
 * 4. Log admin actions for audit trail
 * 
 * Example middleware:
 * ```typescript
 * export function middleware(request: NextRequest) {
 *   const session = await getServerSession();
 *   if (!session || session.user.role !== 'admin') {
 *     return NextResponse.redirect('/login');
 *   }
 *   return NextResponse.next();
 * }
 * ```
 */

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  RefreshCw,
  Loader2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface SMSLog {
  id: string;
  messageId: string;
  bookingId: string;
  customerName: string;
  phoneNumber: string;
  messagePreview: string;
  messageType: "confirmation" | "24hr_reminder" | "1hr_reminder";
  status: "sent" | "pending" | "delivered" | "failed";
  cost: number;
  sentAt: string;
  error?: string;
  createdAt: string;
}

interface SMSLogsResponse {
  success: boolean;
  logs: SMSLog[];
  total: number;
  error?: string;
}

interface SMSStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  delivered: number;
  successRate: number;
  creditsRemaining: number;
  totalCost: number;
}

const maskPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  const last = digits.slice(-3);
  const masked = digits.slice(0, -3).replace(/\d/g, "X");
  if (digits.startsWith("61")) {
    // International format: +61 4XX XXX 678
    return `+61 ${masked.slice(2, 5)} ${masked.slice(5, 8)} ${last}`;
  }
  // Local format: 04XX XXX 678
  return `${masked.slice(0, 2)} ${masked.slice(2, 5)} ${masked.slice(5, 8)} ${last}`;
};

const maskCustomerName = (name: string): string => {
  if (name.length <= 2) return name;
  const first = name[0];
  const last = name[name.length - 1];
  const masked = "X".repeat(Math.max(1, name.length - 2));
  return `${first}${masked}${last}`;
};

const getStatusBadge = (status: SMSLog["status"]) => {
  switch (status) {
    case "sent":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Sent
        </Badge>
      );
    case "delivered":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Delivered
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function AdminSMSLogsPage() {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stats, setStats] = useState<SMSStats | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (fromDate) params.set("startDate", fromDate);
      if (toDate) params.set("endDate", toDate);
      if (searchQuery) {
        // Try booking ID first, then phone number
        if (searchQuery.startsWith("BK")) {
          params.set("bookingId", searchQuery);
        } else {
          params.set("phoneNumber", searchQuery);
        }
      }

      const response = await fetch(`/api/admin/sms-logs?${params.toString()}`);
      const data = (await response.json()) as SMSLogsResponse;

      if (data.success) {
        setLogs(data.logs);
        calculateStats(data.logs);
      } else {
        console.error("Failed to fetch SMS logs:", data.error);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to fetch SMS logs:", message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, fromDate, toDate, searchQuery]);

  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch("/api/mobile-message/credits");
      const data = await response.json();
      if (data.success && data.balance !== undefined) {
        setStats((prev) =>
          prev ? { ...prev, creditsRemaining: data.balance } : null
        );
      }
    } catch (error: unknown) {
      console.error("Failed to fetch credits:", error);
    }
  }, []);

  const calculateStats = (logsData: SMSLog[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayLogs = logsData.filter(
      (log) => new Date(log.createdAt) >= today
    );
    const weekLogs = logsData.filter(
      (log) => new Date(log.createdAt) >= weekAgo
    );
    const monthLogs = logsData.filter(
      (log) => new Date(log.createdAt) >= monthAgo
    );

    const total = logsData.length;
    const sent = logsData.filter((log) => log.status === "sent").length;
    const failed = logsData.filter((log) => log.status === "failed").length;
    const pending = logsData.filter((log) => log.status === "pending").length;
    const delivered = logsData.filter(
      (log) => log.status === "delivered"
    ).length;
    const successCount = sent + delivered;
    const successRate =
      total > 0 ? Math.round((successCount / total) * 100) : 0;
    const totalCost = logsData.reduce((sum, log) => sum + log.cost, 0);

    setStats({
      total,
      sent,
      failed,
      pending,
      delivered,
      successRate,
      creditsRemaining: stats?.creditsRemaining || 0,
      totalCost,
    });
  };

  const handleRetry = useCallback(
    async (logId: string) => {
      setRetrying(logId);
      try {
        const response = await fetch(`/api/admin/sms-logs/${logId}/retry`, {
          method: "POST",
        });
        const data = await response.json();

        if (data.success) {
          // Refresh logs after successful retry
          await fetchLogs();
          await fetchCredits();
        } else {
          alert(`Failed to retry SMS: ${data.error}`);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        alert(`Error retrying SMS: ${message}`);
      } finally {
        setRetrying(null);
      }
    },
    [fetchLogs, fetchCredits]
  );

  useEffect(() => {
    fetchLogs();
    fetchCredits();
  }, [fetchLogs, fetchCredits]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (searchQuery && searchQuery.length > 0) {
        const query = searchQuery.toLowerCase();
        return (
          log.bookingId.toLowerCase().includes(query) ||
          log.phoneNumber.toLowerCase().includes(query) ||
          log.customerName.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [logs, searchQuery]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SMS Delivery Logs</h1>
          <p className="text-slate-600 mt-1">
            Monitor and manage SMS notifications
          </p>
        </div>
        <Button onClick={fetchLogs} disabled={loading} variant="outline">
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total SMS</CardTitle>
              <MessageSquare className="w-4 h-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-slate-600 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-slate-600 mt-1">
                {stats.sent + stats.delivered} sent, {stats.failed} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Credits</CardTitle>
              <DollarSign className="w-4 h-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.creditsRemaining}
              </div>
              <p className="text-xs text-slate-600 mt-1">Remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="w-4 h-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalCost.toFixed(2)}
              </div>
              <p className="text-xs text-slate-600 mt-1">AUD</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                From Date
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFromDate(e.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setToDate(e.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Search
              </label>
              <Input
                placeholder="Booking ID or phone"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              No SMS logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium">Booking ID</th>
                    <th className="text-left p-3 text-sm font-medium">Customer</th>
                    <th className="text-left p-3 text-sm font-medium">Phone</th>
                    <th className="text-left p-3 text-sm font-medium">Message</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Message ID</th>
                    <th className="text-left p-3 text-sm font-medium">Timestamp</th>
                    <th className="text-left p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        <Link
                          href={`/admin/bookings/${log.bookingId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {log.bookingId}
                        </Link>
                      </td>
                      <td className="p-3 text-sm">
                        {maskCustomerName(log.customerName)}
                      </td>
                      <td className="p-3 text-sm">
                        {maskPhoneNumber(log.phoneNumber)}
                      </td>
                      <td className="p-3 text-sm text-slate-600 max-w-xs truncate">
                        {log.messagePreview}
                      </td>
                      <td className="p-3">{getStatusBadge(log.status)}</td>
                      <td className="p-3 text-sm text-slate-600 font-mono">
                        {log.messageId || "-"}
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {new Date(log.sentAt).toLocaleString("en-AU", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="p-3">
                        {log.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetry(log.id)}
                            disabled={retrying === log.id}
                          >
                            {retrying === log.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Retry"
                            )}
                          </Button>
                        )}
                        {log.error && (
                          <div className="mt-1 text-xs text-red-600 max-w-xs truncate" title={log.error}>
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            {log.error}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

