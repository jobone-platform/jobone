import React, { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, X, Loader2 } from "lucide-react";

export default function AdminConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this administrative action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "success" | "warning" | "primary"
  loading = false,
  reason = "",
  onReasonChange = null,
  showReasonInput = false,
  reasonPlaceholder = "Provide a note or reason (optional)...",
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <ShieldAlert className="text-rose-500" size={24} />,
          iconBg: "bg-rose-500/10 border border-rose-500/20",
          button:
            "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-500",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="text-emerald-500" size={24} />,
          iconBg: "bg-emerald-500/10 border border-emerald-500/20",
          button:
            "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-emerald-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="text-amber-500" size={24} />,
          iconBg: "bg-amber-500/10 border border-amber-500/20",
          button:
            "bg-amber-600 hover:bg-amber-700 text-black shadow-xs focus-visible:ring-amber-500",
        };
      default:
        return {
          icon: <CheckCircle2 className="text-[var(--theme-text)]" size={24} />,
          iconBg: "bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)]",
          button:
            "bg-[var(--theme-text)] hover:opacity-90 text-[var(--theme-bg)] shadow-xs focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-silver)]",
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-2xl p-6 relative overflow-hidden transition-all transform scale-100"
      >
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded-lg hover:bg-[var(--theme-surface-hover)] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${vStyles.iconBg}`}>
            {vStyles.icon}
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h3
              id="confirm-dialog-title"
              className="text-lg font-bold font-display text-[var(--theme-text)] leading-snug"
            >
              {title}
            </h3>
            <p className="mt-2 text-sm text-[var(--theme-text-muted)] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {showReasonInput && onReasonChange && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-[var(--theme-text)] uppercase tracking-wider mb-1.5 font-mono">
              Reason / Administrative Note
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] resize-none font-medium"
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[var(--theme-border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${vStyles.button} disabled:opacity-60`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

