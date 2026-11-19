import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useProtectedAction } from "../context/ProtectedActionContext";

export default function ProtectedActionToast() {
  const { toast, showToast } = useProtectedAction();

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[300] max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--theme-gold-border)] bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] shadow-xl backdrop-blur-md">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isSuccess
                ? "bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)]"
                : isError
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                : "bg-[var(--theme-card)] text-[var(--theme-text)] border border-[var(--theme-border)]"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-[var(--theme-gold)]" />
            ) : isError ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5 text-[var(--theme-gold)]" />
            )}
          </div>

          <div className="flex-1 text-xs font-semibold leading-snug">
            {toast.message}
          </div>

          <button
            type="button"
            onClick={() => showToast(null)}
            className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
