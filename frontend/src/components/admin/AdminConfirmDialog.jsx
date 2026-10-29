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
          icon: <ShieldAlert className="text-rose-600 dark:text-rose-400" size={24} />,
          iconBg: "bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60",
          button:
            "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 focus-visible:ring-rose-500",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />,
          iconBg: "bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60",
          button:
            "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 focus-visible:ring-emerald-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="text-amber-600 dark:text-amber-400" size={24} />,
          iconBg: "bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60",
          button:
            "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/30 focus-visible:ring-amber-500",
        };
      default:
        return {
          icon: <CheckCircle2 className="text-indigo-600 dark:text-indigo-400" size={24} />,
          iconBg: "bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60",
          button:
            "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 focus-visible:ring-indigo-500",
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden transition-all transform scale-100"
      >
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
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
              className="text-lg font-bold text-slate-900 dark:text-white leading-snug"
            >
              {title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {showReasonInput && onReasonChange && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Reason / Administrative Note
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none font-medium"
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
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

