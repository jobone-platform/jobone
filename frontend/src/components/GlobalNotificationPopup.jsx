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
          `https://jobone-mrpy.onrender.com/applications/${userId}`,
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
        `https://jobone-mrpy.onrender.com/applications/${applicationId}/seen`,
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
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider">
            <Clock size={12} /> Interview
          </span>
        );
      case "Assignment Scheduled":
        return (
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider">
            <FileText size={12} /> Assignment
          </span>
        );
      case "shortlisted":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider">
            <CheckCircle2 size={12} /> Shortlisted
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {unreadQueue.map((app) => (
          <motion.div
            key={app.applicationId}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 overflow-hidden flex flex-col"
          >
            {/* Toast Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <BellRing size={14} className="animate-pulse" />
                <span className="text-xs font-bold tracking-wide">
                  Application Update
                </span>
              </div>
              <button
                onClick={() => handleDismissLocal(app.applicationId)}
                className="text-indigo-200 hover:text-white transition-colors p-1"
                title="Dismiss for now (will remind later)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Toast Body */}
            <div className="p-4">
              <div className="mb-3">
                {/* Job Title */}
                <p className="text-sm font-extrabold text-slate-900 leading-tight truncate">
                  {app.job?.title || "Job Title Unavailable"}
                </p>

                {/* Company */}
                <p className="text-xs text-slate-500 font-medium">
                  {app.job?.postedByCompany || "Company"}
                </p>

                {/* Location + Mode */}
                <p className="text-[11px] text-slate-400 mt-1">
                  📍{" "}
                  {app.job?.mode === "Work from Home"
                    ? "Remote"
                    : (typeof app.job?.location === "object"
                        ? app.job?.location?.address
                        : app.job?.location) || "Office"}
                </p>

                {/* Salary */}
                <p className="text-[11px] font-bold text-emerald-600 mt-1">
                  ₹{" "}
                  {app.job?.salaryAmount
                    ? app.job.salaryAmount.toLocaleString()
                    : "TBD"}
                </p>
              </div>

              <div className="mb-3">{getStatusBadge(app.status)}</div>

              {app.employerMessage && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MessageCircle size={10} /> Note from Employer
                  </p>
                  <p className="text-xs text-slate-700 font-medium line-clamp-3">
                    {app.employerMessage}
                  </p>
                </div>
              )}

              {/* FACT: The explicit Acknowledge button */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleAcknowledge(app.applicationId)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-colors"
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
