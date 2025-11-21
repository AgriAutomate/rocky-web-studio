"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SMSLog {
  id: string;
  timestamp: string;
  to: string;
  messageType: string;
  status: "success" | "failed" | "pending";
  error?: string;
  response?: any;
  customRef?: string;
  body?: string;
}

interface Stats {
  total: number;
  delivered: number;
  failed: number;
  totalCost: number;
  byType: Record<string, number>;
}

const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  const last = digits.slice(-3);
  const masked = digits.slice(0, -3).replace(/\d/g, "X");
  return `${masked.slice(0, 4)} ${masked.slice(4, 7)} ${last}`;
};

export default function AdminSMSPage() {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    from: "",
    to: "",
  });
  const [credits, setCredits] = useState<string>("Loading...");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.search) {
        params.set("phoneNumber", filters.search);
        params.set("bookingId", filters.search);
      }
      if (filters.from) params.set("startDate", filters.from);
      if (filters.to) params.set("endDate", filters.to);

      const res = await fetch(`/api/admin/sms/stats?${params.toString()}`);
      const data = await res.json();
      setLogs(data.messages || []);
      setStats(data.stats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/mobile-message/credits");
        const data = await res.json();
        if (data.success) {
          setCredits(`${data.balance ?? "N/A"} credits remaining`);
        } else {
          setCredits("Unable to fetch credits");
        }
      } catch (err) {
        setCredits("Unable to fetch credits");
      }
    };
    fetchCredits();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs;
  }, [logs]);

  const exportCSV = () => {
    const header = [
      "timestamp",
      "recipient",
      "messageType",
      "status",
      "error",
      "customRef",
    ];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.to,
      log.messageType,
      log.status,
      log.error || "",
      log.customRef || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  };

  const handleRetry = async (log: SMSLog) => {
    try {
      await fetch("/api/notifications/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: log.to,
          name: "Customer",
          date: "",
          time: "",
          serviceType: log.messageType,
          customRef: log.customRef,
        }),
      });
      fetchStats();
    } catch (err) {
      console.warn("Retry failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl space-y-6 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <h1 className="text-2xl font-semibold text-slate-900">
            SMS Activity
          </h1>
          <p className="text-sm text-slate-500">
            Monitor booking confirmation and reminder deliveries
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow">
            <p className="text-sm text-slate-500">Total Today</p>
            <p className="text-3xl font-bold">
              {stats?.total ?? "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow">
            <p className="text-sm text-slate-500">Success Rate</p>
            <p className="text-3xl font-bold">
              {stats
                ? `${Math.round(
                    (stats.delivered / Math.max(1, stats.total)) * 100
                  )}%`
                : "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow">
            <p className="text-sm text-slate-500">Failed Attempts</p>
            <p className="text-3xl font-bold">
              {stats?.failed ?? "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow">
            <p className="text-sm text-slate-500">Credits Remaining</p>
            <p className="text-3xl font-bold">{credits}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-slate-500">From</label>
              <Input
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, from: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">To</label>
              <Input
                type="date"
                value={filters.to}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Status</label>
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="all">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500">Search</label>
              <Input
                placeholder="Booking ID or phone"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
              />
            </div>
            <Button
              onClick={fetchStats}
              className="flex items-center gap-2 text-sm"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">SMS Logs</h2>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              Export CSV
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-slate-500">
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Recipient</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Error</th>
                  <th className="px-3 py-2">Booking</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-500" />
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{maskPhone(log.to)}</td>
                      <td className="px-3 py-2">{log.messageType}</td>
                      <td className="px-3 py-2 text-sm">
                        {log.status === "success" ? (
                          <span className="text-emerald-600">Success</span>
                        ) : (
                          <span className="text-rose-600">Failed</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-rose-600">
                        {log.error || "—"}
                      </td>
                      <td className="px-3 py-2">{log.customRef || "—"}</td>
                      <td className="px-3 py-2 space-x-2">
                        {log.status === "failed" && (
                          <Button
                            size="xs"
                            onClick={() => handleRetry(log)}
                          >
                            Retry
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            alert(log.body || "Message body unavailable")
                          }
                        >
                          View content
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SMSMessage {
  id: string;
  messageId: string;
  bookingId: string;
  phoneNumber: string;
  messageType: "confirmation" | "24hr_reminder" | "1hr_reminder";
  status: "pending" | "delivered" | "failed";
  cost: number;
  sentAt: string;
  scheduledFor?: string;
  error?: string;
  createdAt: string;
}

interface SMSStats {
  total: number;
  delivered: number;
  failed: number;
  pending: number;
  totalCost: number;
  byType: Record<string, number>;
}

export default function AdminSMSPage() {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [stats, setStats] = useState<SMSStats>({
    total: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    totalCost: 0,
    byType: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [bookingIdFilter, setBookingIdFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (bookingIdFilter) params.append("bookingId", bookingIdFilter);
      if (phoneFilter) params.append("phoneNumber", phoneFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("messageType", typeFilter);

      const response = await fetch(`/api/admin/sms/stats?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch SMS data");
      }

      setMessages(data.messages || []);
      setStats(data.stats || stats);
    } catch (err: any) {
      setError(err.message || "Failed to load SMS data");
      console.error("Error fetching SMS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  const clearFilters = () => {
    setBookingIdFilter("");
    setPhoneFilter("");
    setStatusFilter("all");
    setTypeFilter("all");
    fetchData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "delivered":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Delivered
          </span>
        );
      case "failed":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Failed
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Pending
          </span>
        );
      default:
        return <span className={baseClasses}>{status}</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "confirmation":
        return "Confirmation";
      case "24hr_reminder":
        return "24hr Reminder";
      case "1hr_reminder":
        return "1hr Reminder";
      default:
        return type;
    }
  };

  const formatPhone = (phone: string) => {
    // Format for display: +61 4 1234 5678
    if (phone.startsWith("+61")) {
      const rest = phone.slice(3);
      return `+61 ${rest.slice(0, 1)} ${rest.slice(1, 5)} ${rest.slice(5)}`;
    }
    return phone;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SMS Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor SMS delivery status and costs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-teal-600" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {stats.delivered}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {stats.failed}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="mt-2 text-3xl font-bold text-teal-600">
                  ${stats.totalCost.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Booking ID
              </label>
              <Input
                placeholder="BK123456"
                value={bookingIdFilter}
                onChange={(e) => setBookingIdFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <Input
                placeholder="+61412345678"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="confirmation">Confirmation</SelectItem>
                  <SelectItem value="24hr_reminder">24hr Reminder</SelectItem>
                  <SelectItem value="1hr_reminder">1hr Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleFilter} className="bg-teal-600 hover:bg-teal-700">
              <Search className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-gray-300"
            >
              Clear
            </Button>
            <Button
              onClick={fetchData}
              variant="outline"
              className="border-gray-300"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Messages Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              SMS Messages ({messages.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Loading messages...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <XCircle className="mx-auto h-8 w-8 text-red-600" />
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <Button
                onClick={fetchData}
                className="mt-4 bg-teal-600 hover:bg-teal-700"
              >
                Retry
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No messages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Date/Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Message ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {messages.map((message) => (
                    <tr key={message.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        <div>
                          {format(new Date(message.sentAt), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(message.sentAt), "h:mm a")}
                        </div>
                        {message.scheduledFor && (
                          <div className="mt-1 text-xs text-blue-600">
                            Scheduled:{" "}
                            {format(new Date(message.scheduledFor), "MMM d, h:mm a")}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {message.bookingId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatPhone(message.phoneNumber)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {getTypeLabel(message.messageType)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(message.status)}
                          {getStatusBadge(message.status)}
                        </div>
                        {message.error && (
                          <div className="mt-1 text-xs text-red-600">
                            {message.error}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        ${message.cost.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <code className="text-xs">{message.messageId || "N/A"}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

