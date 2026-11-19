import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  X,
  ArrowRight,
  UserCheck,
  Building2,
  Bookmark,
  Send,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import { useProtectedAction } from "../context/ProtectedActionContext";

export default function ProtectedAuthModal() {
  const { authModalOpen, closeAuthModal, actionConfig } = useProtectedAction();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!authModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen || !actionConfig) return null;

  const {
    action = "generic",
    requiredRole = "jobseeker",
    title,
    subtitle,
    resourceId,
    returnUrl,
  } = actionConfig;

  const isEmployerAction = requiredRole === "employer";

  // Derive contextual messaging
  let displayTitle = title;
  let displaySubtitle = subtitle;
  let ActionIcon = Lock;

  if (action === "apply") {
    displayTitle = title || "Sign in to apply for this job";
    displaySubtitle =
      subtitle ||
      "Create a candidate profile or sign in to submit your direct application to this verified employer.";
    ActionIcon = Send;
  } else if (action === "save_job") {
    displayTitle = title || "Sign in to save this opportunity";
    displaySubtitle =
      subtitle ||
      "Sign in to save this opportunity to your personal career workspace and track it across devices.";
    ActionIcon = Bookmark;
  } else if (action === "post_job" || isEmployerAction) {
    displayTitle =
      title || "Sign in or create an Employer account to publish job opportunities";
    displaySubtitle =
      subtitle ||
      "Verified employer credentials are required to post requisitions, review candidate pools, and schedule interviews.";
    ActionIcon = PlusCircle;
  } else if (!displayTitle) {
    displayTitle = "Sign in to continue";
    displaySubtitle = "Create an account or sign in to use this JobOne feature.";
  }

  const handleSignIn = () => {
    closeAuthModal();
    navigate("/login", {
      state: {
        tab: isEmployerAction ? "employer" : "user",
        from: { pathname: returnUrl || window.location.pathname },
        pendingAction: actionConfig,
      },
    });
  };

  const handleCreateAccount = () => {
    closeAuthModal();
    if (isEmployerAction) {
      navigate("/employerregisteroption", {
        state: { pendingAction: actionConfig },
      });
    } else {
      navigate("/userregister", {
        state: { pendingAction: actionConfig },
      });
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={closeAuthModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="protected-auth-modal-title"
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
            onClick={closeAuthModal}
            aria-label="Close dialog and continue browsing"
            className="absolute top-5 right-5 p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon + Badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--theme-gold-surface)] border border-[var(--theme-gold-border)] text-[var(--theme-gold)] flex items-center justify-center mb-4 shadow-sm">
              <ActionIcon className="w-7 h-7" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] mb-3">
              {isEmployerAction ? "Employer Authentication Required" : "Candidate Authentication Required"}
            </span>

            <h3
              id="protected-auth-modal-title"
              className="text-xl sm:text-2xl font-black text-[var(--theme-text)] tracking-tight leading-snug"
            >
              {displayTitle}
            </h3>

            <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-2 leading-relaxed max-w-sm">
              {displaySubtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Sign In Button */}
            <button
              type="button"
              onClick={handleSignIn}
              className="w-full py-3.5 px-5 rounded-2xl bg-[var(--theme-gold)] hover:bg-[var(--theme-gold-bright)] text-black font-extrabold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{isEmployerAction ? "Employer Sign In" : "Sign In to Continue"}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            {/* Secondary Create Account Button */}
            <button
              type="button"
              onClick={handleCreateAccount}
              className="w-full py-3.5 px-5 rounded-2xl bg-[var(--theme-card)] hover:bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] hover:border-[var(--theme-gold)] font-bold text-sm tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isEmployerAction ? (
                <>
                  <Building2 className="w-4 h-4 text-[var(--theme-gold)]" />
                  <span>Create Employer Account</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-[var(--theme-gold)]" />
                  <span>Create Candidate Account</span>
                </>
              )}
            </button>

            {/* Continue Browsing (Public exploration preservation) */}
            <button
              type="button"
              onClick={closeAuthModal}
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
