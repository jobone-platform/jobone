import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  X,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Building2,
} from "lucide-react";
import { useAuth } from "../routes/Context";
import { useProtectedAction } from "../context/ProtectedActionContext";

export default function RoleMismatchModal() {
  const { roleMismatchModalOpen, closeRoleMismatchModal, mismatchConfig } =
    useProtectedAction();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!roleMismatchModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeRoleMismatchModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roleMismatchModalOpen, closeRoleMismatchModal]);

  if (!roleMismatchModalOpen || !mismatchConfig) return null;

  const { currentRole, requiredRole, actionName } = mismatchConfig;

  const needsCandidate = requiredRole === "jobseeker" || requiredRole === "candidate";
  const needsEmployer = requiredRole === "employer";

  const handleSwitchAccount = () => {
    closeRoleMismatchModal();
    logout();
    navigate("/login", {
      state: {
        tab: needsEmployer ? "employer" : "user",
      },
    });
  };

  const handleGoToMyDashboard = () => {
    closeRoleMismatchModal();
    if (currentRole === "employer") {
      navigate("/employerdashboard");
    } else if (currentRole === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/userdashboard");
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={closeRoleMismatchModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-mismatch-modal-title"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl border border-[var(--theme-gold-border)] bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] shadow-2xl overflow-hidden p-6 sm:p-8"
        >
          {/* Close Dismiss Button */}
          <button
            type="button"
            onClick={closeRoleMismatchModal}
            aria-label="Close dialog"
            className="absolute top-5 right-5 p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon + Badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--theme-gold-surface)] border border-[var(--theme-gold-border)] text-[var(--theme-gold)] flex items-center justify-center mb-4 shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] mb-3">
              Role Permission Notice
            </span>

            <h3
              id="role-mismatch-modal-title"
              className="text-xl sm:text-2xl font-black text-[var(--theme-text)] tracking-tight leading-snug"
            >
              {needsCandidate
                ? "Candidate Account Required"
                : needsEmployer
                ? "Employer Account Required"
                : "Different Account Role Required"}
            </h3>

            <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-2 leading-relaxed max-w-sm">
              {needsCandidate ? (
                <>
                  You are currently signed in as an{" "}
                  <strong className="text-[var(--theme-text)] font-semibold capitalize">
                    {currentRole}
                  </strong>
                  . Applying to jobs and maintaining personal career collections
                  requires an active Candidate account.
                </>
              ) : needsEmployer ? (
                <>
                  You are currently signed in as a{" "}
                  <strong className="text-[var(--theme-text)] font-semibold capitalize">
                    {currentRole}
                  </strong>
                  . Publishing requisitions and managing applicant pipelines
                  requires a verified Employer account.
                </>
              ) : (
                <>This action requires elevated administrative credentials.</>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Switch Account */}
            <button
              type="button"
              onClick={handleSwitchAccount}
              className="w-full py-3.5 px-5 rounded-2xl bg-[var(--theme-gold)] hover:bg-[var(--theme-gold-bright)] text-black font-extrabold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <LogOut className="w-4 h-4 text-black" />
              <span>
                Switch to {needsCandidate ? "Candidate" : "Employer"} Account
              </span>
            </button>

            {/* Go to Dashboard */}
            <button
              type="button"
              onClick={handleGoToMyDashboard}
              className="w-full py-3 px-5 rounded-2xl bg-[var(--theme-card)] hover:bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] hover:border-[var(--theme-gold)] font-bold text-xs sm:text-sm tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-[var(--theme-gold)]" />
              <span>
                Return to My {currentRole === "employer" ? "Employer" : "Candidate"} Dashboard
              </span>
            </button>

            {/* Cancel & Continue Browsing */}
            <button
              type="button"
              onClick={closeRoleMismatchModal}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer text-center"
            >
              Continue Browsing as Visitor
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
