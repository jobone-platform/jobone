import React, { useEffect } from "react";
import { LogOut, X } from "lucide-react";

export default function CandidateLogoutModal({ isOpen, onClose, onConfirm }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-logout-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Backdrop dismissal */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-2xl shadow-2xl p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--theme-border-focus)]"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
            <LogOut size={20} />
          </div>
          <div>
            <h3 id="candidate-logout-modal-title" className="text-lg font-bold tracking-tight">
              Sign out of JobOne?
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] font-medium">
              Candidate Workspace
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed mb-6">
          You are about to sign out of your candidate workspace. Your applications, resumes, and saved jobs will remain safely stored, but you must sign in again to apply or view status updates.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            <LogOut size={16} />
            Confirm Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}


