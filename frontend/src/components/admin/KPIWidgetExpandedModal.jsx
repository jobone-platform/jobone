import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150 text-[var(--theme-text)] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Modal Header ────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 border-b border-[var(--theme-border)] flex items-start justify-between gap-4 shrink-0 bg-[var(--theme-surface-elevated)]/40">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
              <Icon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 id="widget-modal-title" className="text-xl sm:text-2xl font-display font-extrabold tracking-tight">
                  {title} Analytics & Metrics
                </h2>
                {badge && (
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      badgeVariant === "warning"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border-silver)]"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                Real-time platform insights and operational breakdown
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Modal Scrollable Body ───────────────────────────────── */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Metric & Period Selector */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] font-bold">
                Live Data Value
              </p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
                  {typeof primaryValue === "number" ? primaryValue.toLocaleString() : primaryValue}
                </span>
                {trendText && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-mono font-bold ${
                      isPositiveTrend
                        ? "text-emerald-400"
                        : "text-[var(--theme-text-muted)]"
                    }`}
                  >
                    {isPositiveTrend ? <TrendingUp size={14} /> : null}
                    <span>{trendText}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Time Period Filter Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] self-start sm:self-auto text-xs font-mono">
              <button
                type="button"
                onClick={() => setPeriod("7d")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  period === "7d"
                    ? "bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-xs"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setPeriod("30d")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  period === "30d"
                    ? "bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-xs"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                }`}
              >
                4 Weeks
              </button>
            </div>
          </div>

          {/* Historical Trend Bar Graph */}
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] font-semibold text-[11px]">
                {period === "7d" ? "Daily Distribution (Last 7 Days)" : "Weekly Aggregation (Last 30 Days)"}
              </span>
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)]">Peak: {maxVal} events</span>
            </div>

            <div className="h-32 p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/60 border border-[var(--theme-border)] flex items-end justify-between gap-2">
              {chartData.map((val, idx) => {
                const heightPct = Math.max((val / maxVal) * 100, 8);
                const label =
                  period === "7d"
                    ? ["6d ago", "5d ago", "4d ago", "3d ago", "2d ago", "Yday", "Today"][idx] || `D${idx}`
                    : `W${idx + 1}`;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] transition-colors opacity-0 group-hover:opacity-100 font-bold">
                      {val}
                    </span>
                    <div className="w-full bg-[var(--theme-surface)] rounded-md h-full flex items-end overflow-hidden p-0.5 border border-[var(--theme-border)]">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full rounded-sm bg-[var(--theme-accent-silver)] group-hover:bg-[var(--theme-text)] transition-all duration-300"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-[var(--theme-text-subtle)] truncate w-full text-center">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Breakdown Items */}
          {breakdown && breakdown.length > 0 && (
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] font-bold mb-3">
                Operational Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)]"
                  >
                    <p className="text-xs text-[var(--theme-text-muted)]">{item.label}</p>
                    <p className="text-xl font-display font-extrabold text-[var(--theme-text)] mt-0.5">
                      {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                    </p>
                    {item.helper && (
                      <p className="text-[10px] font-mono text-[var(--theme-text-subtle)] mt-1">{item.helper}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Action Items (for Pending queue widget) */}
          {pendingItems && pendingItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] font-bold">
                  Queue Preview ({pendingItems.length} items)
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(targetTab);
                    onClose();
                  }}
                  className="text-xs font-bold text-[var(--theme-accent-silver)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Full Queue</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pendingItems.slice(0, 5).map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--theme-text)] truncate">{item.title}</p>
                      <p className="text-[11px] text-[var(--theme-text-muted)] truncate font-mono">
                        {item.secondary} • {item.date ? new Date(item.date).toLocaleDateString() : "Queued"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          item.type === "job"
                            ? onReviewJob && onReviewJob(item.id, "active")
                            : onReviewEmployer && onReviewEmployer(item.id, "approved")
                        }
                        className="px-2.5 py-1 rounded-lg bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          item.type === "job"
                            ? onReviewJob && onReviewJob(item.id, "rejected")
                            : onReviewEmployer && onReviewEmployer(item.id, "rejected")
                        }
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Modal Footer ────────────────────────────────────────── */}
        <div className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-surface-muted)]/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-[var(--theme-border)] hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer"
          >
            Close
          </button>

          {targetTab && (
            <button
              type="button"
              onClick={() => {
                onNavigate(targetTab);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Explore Section in Table</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
