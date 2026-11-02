import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function AdminLogoutModal({
  isOpen,
  onClose,
  onConfirm,
  adminInfo = {},
}) {
  const [isExiting, setIsExiting] = useState(false);
  const [exitStep, setExitStep] = useState(0);

  // Reset internal states when opened
  useEffect(() => {
    if (isOpen) {
      setIsExiting(false);
      setExitStep(0);
    }
  }, [isOpen]);

  // Handle ESC key to dismiss (unless currently executing logout sequence)
  useEffect(() => {
    if (!isOpen || isExiting) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExiting, onClose]);

  const handleStartLogout = () => {
    setIsExiting(true);
    setExitStep(1);

    // Step 1: Invalidate tokens and begin progress animation
    setTimeout(() => {
      setExitStep(2);
    }, 350);

    // Step 2: Clear storage & prepare redirection
    setTimeout(() => {
      setExitStep(3);
    }, 650);

    // Step 3: Trigger actual logout callback and navigation
    setTimeout(() => {
      if (onConfirm) onConfirm();
    }, 950);
  };

  if (!isOpen) return null;

  const role = adminInfo?.role || "superAdmin";
  const roleNameMap = {
    superAdmin: "Super Administrator",
    employerAdmin: "Employer Admin",
    jobseekerAdmin: "Jobseeker Admin",
  };

  const adminInitials = (adminInfo?.name || "Admin")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Modern Backdrop with smooth blur and fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={isExiting ? undefined : onClose}
          className="fixed inset-0 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 text-slate-900 dark:text-slate-100"
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -ml-12 -mb-12" />

          {/* Close button (top right) */}
          {!isExiting && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}

          {/* ============================================================== */}
          {/* STATE 1: CONFIRMATION PROMPT                                   */}
          {/* ============================================================== */}
          {!isExiting ? (
            <div className="relative z-10 space-y-6">
              {/* Icon & Title Header */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {/* Pulsing ring aura */}
                  <div className="absolute inset-0 rounded-2xl bg-rose-500/25 blur-md animate-pulse" />
                  <div className="relative w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                    <LogOut size={28} className="translate-x-0.5" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Sign Out of Admin Console
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm">
                  Are you sure you want to end your administrative session? All system audit changes will remain saved.
                </p>
              </div>

              {/* Active Admin Identity Snapshot */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    {adminInitials}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {adminInfo?.name || "Administrator"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-mono">
                      {adminInfo?.email || "admin@jobone.com"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {roleNameMap[role] || role}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Now</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer"
                >
                  Stay Signed In
                </button>
                <button
                  type="button"
                  onClick={handleStartLogout}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* STATE 2: ANIMATED LOGOUT & SESSION TERMINATION SEQUENCE        */
            /* ============================================================== */
            <div className="relative z-10 py-4 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Spinning High-Tech Security Ring */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Rotating Outer Gradient Orbit */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-3 border-transparent border-t-rose-500 border-r-indigo-500 shadow-md"
                />
                {/* Inner Icon */}
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-inner">
                  {exitStep === 3 ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                    >
                      <CheckCircle2 size={28} className="text-emerald-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    >
                      <Lock size={24} />
                    </motion.div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {exitStep === 3 ? "Session Terminated" : "Terminating Administrator Session"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {exitStep === 1 && "Invalidating active cryptographic tokens..."}
                  {exitStep === 2 && "Clearing administrative caches & session storage..."}
                  {exitStep === 3 && "Securely redirecting to authentication portal..."}
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden relative">
                <motion.div
                  initial={{ width: "10%" }}
                  animate={{
                    width: exitStep === 1 ? "45%" : exitStep === 2 ? "85%" : "100%",
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`h-full rounded-full transition-colors ${
                    exitStep === 3
                      ? "bg-emerald-500 shadow-emerald-500/50 shadow-sm"
                      : "bg-gradient-to-r from-rose-500 via-indigo-500 to-rose-600"
                  }`}
                />
              </div>

              {/* Micro Status Checkpoints */}
              <div className="w-full pt-1 space-y-1.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={13}
                    className={exitStep >= 1 ? "text-emerald-500" : "text-slate-300 dark:text-slate-700"}
                  />
                  <span>Revoke authorization tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={13}
                    className={exitStep >= 2 ? "text-emerald-500" : "text-slate-300 dark:text-slate-700"}
                  />
                  <span>Purge local session storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={13}
                    className={exitStep >= 3 ? "text-emerald-500" : "text-slate-300 dark:text-slate-700"}
                  />
                  <span>Redirect to login screen</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

