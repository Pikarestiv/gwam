"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Trash2,
  Clock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

type ReportStatus = "" | "pending" | "reviewed" | "resolved";

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReportStatus>("pending");
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", page, statusFilter],
    queryFn: () =>
      adminApi.getReports(page, statusFilter).then((r) => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      admin_note,
    }: {
      id: number;
      status: "pending" | "reviewed" | "resolved";
      admin_note?: string;
    }) => adminApi.updateReport(id, { status, admin_note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const deleteMsgMutation = useMutation({
    mutationFn: (msgId: number) => adminApi.deleteMessage(msgId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const reports = data?.data || [];
  const meta = data || { last_page: 1, total: 0 };

  const handleUpdateStatus = (
    id: number,
    status: "pending" | "reviewed" | "resolved",
  ) => {
    updateMutation.mutate({
      id,
      status,
      admin_note: noteInputs[id],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="text-orange-500" />
            Moderation Reports
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review user-submitted reports for offensive messages and community violations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(
            [
              { label: "Pending", value: "pending" },
              { label: "Reviewed", value: "reviewed" },
              { label: "Resolved", value: "resolved" },
              { label: "All", value: "" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                statusFilter === tab.value
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Loading reports queue...</div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
          <p className="text-white font-medium text-lg">No reports found</p>
          <p className="text-slate-500 text-sm mt-1">
            {statusFilter
              ? `There are no ${statusFilter} reports in the moderation queue.`
              : "The moderation queue is completely clear."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => {
            const msg = report.message;
            const roomMsg = report.room_message;
            const content = msg?.content || roomMsg?.content || "(Content removed or unavailable)";
            const targetDesc = msg?.recipient
              ? `@${msg.recipient.username}`
              : roomMsg?.room
              ? `Room #${roomMsg.room.code}`
              : "Unknown target";

            return (
              <div
                key={report.id}
                className="card border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">
                        #{report.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {report.reason || "Reported Violation"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          report.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : report.status === "reviewed"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {report.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Reported Content Box */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 my-2">
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <MessageSquare size={12} />
                        Reported message to <span className="text-slate-300 font-medium">{targetDesc}</span>:
                      </div>
                      <p className="text-slate-200 text-sm italic font-mono break-words">
                        "{content}"
                      </p>
                    </div>

                    {/* Report detail and reporter */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      {report.extra_detail && (
                        <span>
                          <strong>User Detail:</strong> {report.extra_detail}
                        </span>
                      )}
                      <span>
                        <strong>Reporter:</strong>{" "}
                        {report.reporter?.username
                          ? `@${report.reporter.username}`
                          : report.reporter_ip
                          ? `IP: ${report.reporter_ip}`
                          : "Anonymous"}
                      </span>
                      {report.admin_note && (
                        <span className="text-purple-400">
                          <strong>Admin Note:</strong> {report.admin_note}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col items-center gap-2 flex-shrink-0">
                    {report.status !== "reviewed" && (
                      <button
                        onClick={() => handleUpdateStatus(report.id, "reviewed")}
                        disabled={updateMutation.isPending}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                        title="Mark as under review"
                      >
                        <Eye size={14} /> Review
                      </button>
                    )}
                    {report.status !== "resolved" && (
                      <button
                        onClick={() => handleUpdateStatus(report.id, "resolved")}
                        disabled={updateMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
                        title="Mark as resolved"
                      >
                        <CheckCircle size={14} /> Resolve
                      </button>
                    )}
                    {report.message_id && !report.message?.is_deleted && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this reported message permanently?")) {
                            deleteMsgMutation.mutate(report.message_id);
                          }
                        }}
                        disabled={deleteMsgMutation.isPending}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
                        title="Delete the offending message"
                      >
                        <Trash2 size={14} /> Delete Msg
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                Page {meta.current_page || page} of {meta.last_page} ({meta.total} reports)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page >= meta.last_page}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
