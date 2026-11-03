import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Check,
  XCircle,
} from "lucide-react";

export default function KPIWidgetExpandedModal({
  widget,
  isOpen,
  onClose,
  onNavigate,
  onReviewJob,
  onReviewEmployer,
}) {
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !widget) return null;

  const {
    id,
    title,
    primaryValue,
    icon: Icon,
    color,
    badge,
    badgeVariant,
    trendText,
    isPositiveTrend,
    breakdown = [],
    dailyData7d = [],
    dailyData30d = [],
    pendingItems = [],
    targetTab,
  } = widget;

  const chartData = period === "30d" ? dailyData30d : dailyData7d;
  const maxVal = Math.max(...chartData, 1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="widget-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Modal Header ────────────────────────────────────────── */}
        <div className="p-5 sm:p-7 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${widget.iconBg} ${widget.iconColor}`}
            >
              <Icon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 id="widget-modal-title" className="text-xl sm:text-2xl font-black">
                  {title} Analytics & Details
                </h2>
                {badge && (
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      badgeVariant === "warning"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-time platform insights and operational breakdown
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* ─── Modal Scrollable Body ───────────────────────────────── */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Top Metric & Period Selector */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Primary Metric
              </p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight">
                  {typeof primaryValue === "number" ? primaryValue.toLocaleString() : primaryValue}
                </span>
                {trendText && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs sm:text-sm font-bold ${
                      isPositiveTrend
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {isPositiveTrend ? <TrendingUp size={15} /> : null}
                    <span>{trendText}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Time Period Filter Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPeriod("7d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === "7d"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setPeriod("30d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === "30d"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {/* Interactive Activity Trend Chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar size={15} className="text-slate-400" />
                <span>Activity Trend ({period === "7d" ? "Daily last 7 days" : "4-week breakdown"})</span>
              </h4>
              <span className="text-xs text-slate-400 font-medium">Peak: {maxVal} events</span>
            </div>

            <div className="h-44 sm:h-52 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-end justify-between gap-2 relative">
              {chartData.map((val, idx) => {
                const heightPct = Math.round((val / maxVal) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-opacity mb-1">
                      {val}
                    </span>
                    <div
                      style={{ height: `${Math.max(heightPct, 8)}%` }}
                      className="w-full max-w-[28px] rounded-t-lg bg-slate-900 dark:bg-white group-hover:bg-indigo-600 dark:group-hover:bg-indigo-400 transition-all duration-200 shadow-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-2 font-semibold">
                      {period === "7d" ? `D-${6 - idx}` : `W${idx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown KPI Metrics Grid */}
          {breakdown.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Distribution & Segment Statistics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                  >
                    <p className="text-xs font-semibold text-slate-400 truncate">{item.label}</p>
                    <p className="text-xl font-black mt-1 text-slate-900 dark:text-white">
                      {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                    </p>
                    {item.helper && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.helper}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Items Fast-Action List (When Viewing Pending Widget) */}
          {pendingItems.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                <span>Immediate Pending Review Queue</span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {pendingItems.length} awaiting decision
                </span>
              </h4>
              <div className="space-y-2.5">
                {pendingItems.slice(0, 4).map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.secondary} • {item.type === "job" ? "Job Posting" : "Employer Account"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.type === "job" && onReviewJob) onReviewJob(item.id, "active");
                          else if (onReviewEmployer) onReviewEmployer(item.id, "approved");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.type === "job" && onReviewJob) onReviewJob(item.id, "rejected");
                          else if (onReviewEmployer) onReviewEmployer(item.id, "rejected");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle size={13} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Modal Footer Actions ─────────────────────────────────── */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <p className="text-xs text-slate-400 font-medium">
            Data sourced live from JobOne production database.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            {targetTab && onNavigate && (
              <button
                type="button"
                onClick={() => {
                  onNavigate(targetTab);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Go to {title} Management</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

