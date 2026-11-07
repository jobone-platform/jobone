import React, { useState, useEffect } from "react";
import {
  LogOut,
  ShieldCheck,
  Lock,
  CheckCircle2,
  X,
  Loader2,
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

    setTimeout(() => {
      setExitStep(2);
    }, 350);

    setTimeout(() => {
      setExitStep(3);
    }, 650);

    setTimeout(() => {
      if (onConfirm) onConfirm();
    }, 950);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={!isExiting ? onClose : undefined}
    >
      <div
        className="w-full max-w-md bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-border)] shadow-2xl overflow-hidden p-6 sm:p-7 relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {!isExiting && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}

        {/* Exit Progress Animation Sequence */}
        {isExiting ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center mx-auto text-[var(--theme-accent-silver)]">
              {exitStep === 1 && <Loader2 size={30} className="animate-spin text-[var(--theme-accent-silver)]" />}
              {exitStep === 2 && <Lock size={28} className="text-amber-400 animate-pulse" />}
              {exitStep === 3 && <CheckCircle2 size={30} className="text-emerald-400" />}
            </div>

            <div>
              <h3 className="text-base font-bold text-[var(--theme-text)]">
                {exitStep === 1 && "Invalidating Administrative Session..."}
                {exitStep === 2 && "Securing Sensitive Audit Vault..."}
                {exitStep === 3 && "Session Terminated. Redirecting..."}
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] font-mono mt-1">
                {exitStep === 1 && "Flushing temporary bearer tokens"}
                {exitStep === 2 && "Persisting workspace preferences"}
                {exitStep === 3 && "Navigating to secure admin sign-in gateway"}
              </p>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-48 h-1 bg-[var(--theme-surface-elevated)] rounded-full mx-auto overflow-hidden border border-[var(--theme-border)]">
              <div
                className="h-full bg-[var(--theme-accent-silver)] transition-all duration-300 rounded-full"
                style={{ width: `${(exitStep / 3) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Confirmation Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <LogOut size={22} />
              </div>
              <div>
                <h3 id="logout-title" className="text-lg font-extrabold text-[var(--theme-text)]">
                  Sign Out of Administrative Console?
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-1 leading-relaxed">
                  You are signed in as <span className="font-bold text-[var(--theme-text)]">{adminInfo?.name || "Administrator"}</span> ({adminInfo?.email || "admin@jobone.com"}).
                  Terminating your session clears privileged administrative tokens from this browser.
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center gap-3 text-xs text-[var(--theme-text-muted)]">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>All unsaved moderation drafts or form inputs will be discarded.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartLogout}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-2"
              >
                <LogOut size={14} />
                <span>Confirm Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
