"use client";

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
  Download,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SMSLog {
  id: string;
  timestamp: string;
  to: string;
  messageType: string;
  status: "delivered" | "failed";
  error?: string;
  customRef?: string;
  body?: string;
}

interface SMSStats {
  total: number;
  delivered: number;
  failed: number;
  pending: number;
  totalCost: number;
  byType: Record<string, number>;
}

interface AdminSMSResponse {
  messages?: SMSLog[];
  stats?: SMSStats;
}

interface CreditResponse {
  success?: boolean;
  balance?: number;
}

const maskPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  const last = digits.slice(-3);
  const masked = digits.slice(0, -3).replace(/\d/g, "X");
  return `${masked.slice(0, 4)} ${masked.slice(4, 7)} ${last}`;
};

export default function AdminSMSPage() {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [stats, setStats] = useState<SMSStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "delivered" | "failed">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [credits, setCredits] = useState<string>("Loading...");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (fromDate) params.set("startDate", fromDate);
      if (toDate) params.set("endDate", toDate);
      if (searchQuery) {
        params.set("phoneNumber", searchQuery);
        params.set("bookingId", searchQuery);
      }
      const response = await fetch(`/api/admin/sms/stats?${params.toString()}`);
      const data = (await response.json()) as AdminSMSResponse;
      setLogs(data.messages || []);
      setStats(data.stats || null);
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
      const data = (await response.json()) as CreditResponse;
      if (data.success) {
        setCredits(`${data.balance ?? "N/A"} credits remaining`);
      } else {
        setCredits("Unable to fetch credits");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to fetch Mobile Message credits:", message);
      setCredits("Unable to fetch credits");
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const filteredLogs = useMemo(() => logs, [logs]);

  const handleFromDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFromDate(event.target.value);
  };

  const handleToDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setToDate(event.target.value);
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as "all" | "delivered" | "failed");
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const exportLogs = () => {
    const rows = [
      ["Timestamp", "Recipient", "Type", "Status", "Error", "Reference"],
      ...filteredLogs.map((log) => [
        log.timestamp,
        maskPhoneNumber(log.to),
        log.messageType,
        log.status,
        log.error || "",
        log.customRef || "",
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const anchor = document.createElement("a");
    anchor.href = encodedUri;
    anchor.download = `sms-logs-${new Date().toISOString().split("T")[0]}.csv`;
    anchor.click();
    URL.revokeObjectURL(encodedUri);
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
      fetchLogs();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Retry failed";
      console.warn("Retry failed:", message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl space-y-6 px-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">SMS Activity</h1>
              <p className="text-sm text-slate-500">Monitor confirmations and reminders.</p>
            </div>
            <Button onClick={fetchLogs} disabled={loading} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow">
            <p className="text-sm text-slate-500">Total Sent</p>
            <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow">
            <p className="text-sm text-slate-500">Success Rate</p>
            <p className="text-2xl font-bold">
              {stats ? `${Math.round((stats.delivered / Math.max(1, stats.total)) * 100)}%` : "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow">
            <p className="text-sm text-slate-500">Failed</p>
            <p className="text-2xl font-bold text-rose-600">{stats?.failed ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow">
            <p className="text-sm text-slate-500">Credits Remaining</p>
            <p className="text-2xl font-bold text-emerald-600">{credits}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-slate-500">From</label>
              <Input type="date" value={fromDate} onChange={handleFromDateChange} />
            </div>
            <div>
              <label className="text-xs text-slate-500">To</label>
              <Input type="date" value={toDate} onChange={handleToDateChange} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Status</label>
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500">Search</label>
              <Input
                placeholder="Booking ID or phone"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button onClick={fetchLogs} className="flex items-center gap-2 text-sm" variant="outline">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="text-teal-600" />
              SMS Logs
            </div>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="mr-2 h-4 w-4" />
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
                  <th className="px-3 py-2">Reference</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-slate-500">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-500" />
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-slate-500">
                      No SMS logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-3 py-2 text-sm font-mono">{maskPhoneNumber(log.to)}</td>
                      <td className="px-3 py-2 text-sm">{log.messageType}</td>
                      <td className="px-3 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.status === "delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {log.status}
                        </span>
                        {log.error && (
                          <p className="text-xs text-rose-600 mt-1">{log.error}</p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono text-gray-500">{log.customRef || "—"}</td>
                      <td className="px-3 py-2 space-x-2">
                        {log.status === "failed" && (
                          <Button size="xs" onClick={() => handleRetry(log)}>
                            Retry
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => alert(log.body || "Message body unavailable")}
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
        </section>
      </div>
    </div>
  );
}

