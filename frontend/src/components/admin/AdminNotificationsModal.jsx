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
      className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mt-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <h3 id="notifications-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Platform Notifications
              </h3>
              <p className="text-[11px] text-slate-400">
                {totalAlerts} actionable operational item(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-3 space-y-2.5 max-h-96 overflow-y-auto">
          {pendingJobsCount > 0 && (
            <div
              onClick={() => {
                onNavigateTab("pendingJobs");
                onClose();
              }}
              className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-300 cursor-pointer transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
                  <Briefcase size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {pendingJobsCount} Pending Job{pendingJobsCount > 1 ? "s" : ""}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Jobs submitted by employers awaiting compliance review.
                  </p>
                </div>
              </div>
              <ArrowRight
                size={14}
                className="text-amber-600 dark:text-amber-400 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          )}

          {pendingEmployersCount > 0 && (
            <div
              onClick={() => {
                onNavigateTab("pendingEmployers");
                onClose();
              }}
              className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 hover:border-indigo-300 cursor-pointer transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                  <Building2 size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {pendingEmployersCount} Pending Employer{pendingEmployersCount > 1 ? "s" : ""}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    New recruiters awaiting business document verification.
                  </p>
                </div>
              </div>
              <ArrowRight
                size={14}
                className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          )}

          {unreadContactsCount > 0 && (
            <div
              onClick={() => {
                onNavigateTab("contacts");
                onClose();
              }}
              className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 hover:border-blue-300 cursor-pointer transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                  <Mail size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {unreadContactsCount} Unread Inquir{unreadContactsCount > 1 ? "ies" : "y"}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Customer & recruiter support questions received.
                  </p>
                </div>
              </div>
              <ArrowRight
                size={14}
                className="text-blue-600 dark:text-blue-400 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          )}

          {totalAlerts === 0 && (
            <div className="py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={20} />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Queue is Clear
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All jobs, employers, and messages have been reviewed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

