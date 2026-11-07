import React, { useEffect } from "react";
import {
  Bell,
  X,
  Briefcase,
  Building2,
  Mail,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function AdminNotificationsModal({
  isOpen,
  onClose,
  pendingJobsCount = 0,
  pendingEmployersCount = 0,
  unreadContactsCount = 0,
  onNavigateTab,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalAlerts =
    (pendingJobsCount > 0 ? 1 : 0) +
    (pendingEmployersCount > 0 ? 1 : 0) +
    (unreadContactsCount > 0 ? 1 : 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-title"
      className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mt-14 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-accent-silver)] flex items-center justify-center">
              <Bell size={15} />
            </div>
            <div>
              <h3 id="notifications-title" className="text-sm font-bold text-[var(--theme-text)]">
                Operational Alerts
              </h3>
              <p className="text-[11px] text-[var(--theme-text-muted)]">
                {totalAlerts} actionable operational item(s)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-[var(--theme-border)] max-h-96 overflow-y-auto">
          {pendingJobsCount > 0 && (
            <div
              onClick={() => {
                onNavigateTab("pendingJobs");
                onClose();
              }}
              className="p-3.5 hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--theme-text)]">Job Moderation</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {pendingJobsCount} pending
                  </span>
                </div>
                <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
                  Requisitions awaiting compliance approval before going live on portal.
                </p>
              </div>
            </div>
          )}

          {pendingEmployersCount > 0 && (
            <div
              onClick={() => {
                onNavigateTab("pendingEmployers");
                onClose();
              }}
              className="p-3.5 hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--theme-text)]">Company KYC Verifications</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {pendingEmployersCount} pending
                  </span>
                </div>
                <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
                  Employer organizations submitted legal documents for platform approval.
                </p>
              </div>
            </div>
          )}

          {unreadContactsCount > 0 && (
            <div
              onClick={() => {
                onNavigateTab("notifications");
                onClose();
              }}
              className="p-3.5 hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Mail size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--theme-text)]">Incoming Inquiries</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {unreadContactsCount} new
                  </span>
                </div>
                <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
                  Support and contact form submissions awaiting response.
                </p>
              </div>
            </div>
          )}

          {totalAlerts === 0 && (
            <div className="p-8 text-center text-[var(--theme-text-muted)]">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-xs font-bold text-[var(--theme-text)]">All Clear</p>
              <p className="text-[11px] mt-0.5">No pending moderation or urgent alerts at this time.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[var(--theme-surface-muted)]/50 border-t border-[var(--theme-border)] text-center">
          <button
            type="button"
            onClick={() => {
              onNavigateTab("notifications");
              onClose();
            }}
            className="text-xs font-bold text-[var(--theme-accent-silver)] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Open Notification Workspace</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
