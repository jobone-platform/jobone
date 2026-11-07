import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import IconButton from "./IconButton";

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-xl", // "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl" | "max-w-4xl"
  showClose = true,
  className = "",
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-desc" : undefined}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${maxWidth} rounded-3xl border border-[var(--theme-border-silver)] bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-2xl overflow-hidden z-10 my-auto ${className}`}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="px-6 py-5 border-b border-[var(--theme-border)] flex items-center justify-between gap-4">
                <div className="min-w-0">
                  {title && (
                    <h3
                      id="modal-title"
                      className="text-lg font-black tracking-tight text-[var(--theme-text)] truncate"
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p
                      id="modal-desc"
                      className="text-xs text-[var(--theme-text-muted)] mt-0.5"
                    >
                      {description}
                    </p>
                  )}
                </div>

                {showClose && (
                  <IconButton
                    icon={<X className="w-4 h-4" />}
                    label="Close dialog"
                    size="sm"
                    variant="ghost"
                    onClick={onClose}
                  />
                )}
              </div>
            )}

            {/* Content Body */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

