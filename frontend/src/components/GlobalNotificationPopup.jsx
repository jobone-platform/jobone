import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BellRing,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  X,
  Check,
} from "lucide-react";

export default function GlobalNotificationPopup() {
  const [unreadQueue, setUnreadQueue] = useState([]);

  useEffect(() => {
    const fetchUnreadApplications = async () => {
      try {
        const storedUser = localStorage.getItem("userInfo");
        const storedEmployer = localStorage.getItem("employerInfo");

        // FACT: Safety gate added to prevent unauthenticated 401 exceptions on public pages
        if (!storedUser && !storedEmployer) {
          return;
        }

        // If it's an employer logged in, skip fetching seeker notifications entirely
        if (!storedUser && storedEmployer) {
          return;
        }

        const userInfo = JSON.parse(storedUser);
        const { token, id } = userInfo;
        const userId = id || userInfo.userId;

        if (!token || !userId) return;

        const { data } = await axios.get(
          `${API_BASE_URL}/applications/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const apps = data.applications || [];

        const unread = apps.filter(
          (app) => app.applicantHasSeen === false && app.status !== "applied",
        );

        if (unread.length > 0) {
          setUnreadQueue(unread);
        }
      } catch (error) {
        console.error("Error fetching global notifications:", error);
      }
    };

    fetchUnreadApplications();
    const intervalId = setInterval(fetchUnreadApplications, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // FACT: Permanently dismisses the notification by updating the database
  const handleAcknowledge = async (applicationId) => {
    setUnreadQueue((prev) =>
      prev.filter((app) => app.applicationId !== applicationId),
    );

    try {
      const storedUser = localStorage.getItem("userInfo");
      const { token } = JSON.parse(storedUser);

      await axios.patch(
        `${API_BASE_URL}/applications/${applicationId}/seen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error("Failed to mark as seen", error);
    }
  };

  // FACT: Temporarily hides the notification for this session only (will reappear on next login)
  const handleDismissLocal = (applicationId) => {
    setUnreadQueue((prev) =>
      prev.filter((app) => app.applicationId !== applicationId),
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "hired":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider">
            <CheckCircle2 size={12} /> Hired
          </span>
        );
      case "NCTT":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider">
            <XCircle size={12} /> Not Considered
          </span>
        );
      case "Interview Scheduled":
        return (
          <span className="inline-flex items-center gap-1 bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider">
            <Clock size={12} /> Interview
          </span>
        );
      case "Assignment Scheduled":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider">
            <FileText size={12} /> Assignment
          </span>
        );
      case "shortlisted":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider">
            <CheckCircle2 size={12} /> Shortlisted
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div role="region" aria-label="Notifications" aria-live="polite" className="fixed top-24 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {unreadQueue.map((app) => (
          <motion.div
            key={app.applicationId}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-[var(--theme-surface)] rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden flex flex-col transition-colors"
          >
            {/* Toast Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--theme-surface-elevated)] border-b border-[var(--theme-border)] text-[var(--theme-text)]">
              <div className="flex items-center gap-2">
                <BellRing size={14} className="text-[var(--theme-gold)] animate-pulse" />
                <span className="text-xs font-bold tracking-wide">
                  Application Update
                </span>
              </div>
              <button
                onClick={() => handleDismissLocal(app.applicationId)}
                aria-label="Dismiss notification"
                className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors p-1 focus-visible:ring-2 focus-visible:ring-[var(--theme-gold)] focus-visible:outline-none rounded cursor-pointer"
                title="Dismiss for now (will remind later)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Toast Body */}
            <div className="p-4">
              <div className="mb-3">
                {/* Job Title */}
                <p className="text-sm font-extrabold text-[var(--theme-text)] leading-tight truncate">
                  {app.job?.title || "Job Title Unavailable"}
                </p>

                {/* Company */}
                <p className="text-xs text-[var(--theme-text-muted)] font-medium">
                  {app.job?.postedByCompany || "Company"}
                </p>

                {/* Location + Mode */}
                <p className="text-[11px] text-[var(--theme-text-muted)] mt-1">
                  📍{" "}
                  {app.job?.mode === "Work from Home"
                    ? "Remote"
                    : (typeof app.job?.location === "object"
                        ? app.job?.location?.address
                        : app.job?.location) || "Office"}
                </p>

                {/* Salary */}
                <p className="text-[11px] font-bold text-[var(--theme-gold)] mt-1">
                  ₹{" "}
                  {app.job?.salaryAmount
                    ? app.job.salaryAmount.toLocaleString()
                    : "TBD"}
                </p>
              </div>

              <div className="mb-3">{getStatusBadge(app.status)}</div>

              {app.employerMessage && (
                <div className="bg-[var(--theme-surface-elevated)] p-3 rounded-xl border border-[var(--theme-border)] mb-3">
                  <p className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MessageCircle size={10} /> Note from Employer
                  </p>
                  <p className="text-xs text-[var(--theme-text)] font-medium line-clamp-3">
                    {app.employerMessage}
                  </p>
                </div>
              )}

              {/* FACT: The explicit Acknowledge button */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleAcknowledge(app.applicationId)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-[var(--theme-gold)] hover:bg-[var(--theme-gold-bright)] rounded-lg transition-colors cursor-pointer shadow-sm hover:shadow"
                  title="Mark as read permanently"
                >
                  <Check size={14} /> Acknowledge
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
