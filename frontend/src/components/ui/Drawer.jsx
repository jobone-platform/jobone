import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import IconButton from "./IconButton";

export default function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = "right", // "right" | "bottom"
  width = "max-w-md",
  className = "",
}) {
  const drawerRef = useRef(null);

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

  const slideVariants = {
    right: {
      hidden: { x: "100%", opacity: 0.5 },
      visible: { x: 0, opacity: 1 },
      exit: { x: "100%", opacity: 0 },
    },
    bottom: {
      hidden: { y: "100%", opacity: 0.5 },
      visible: { y: 0, opacity: 1 },
      exit: { y: "100%", opacity: 0 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "drawer-title" : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideVariants[position]}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full ${
              position === "right"
                ? `ml-auto h-full ${width} border-l`
                : "mt-auto max-h-[85vh] rounded-t-3xl border-t"
            } border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-2xl flex flex-col overflow-hidden ${className}`}
          >
            {/* Header */}
            <div className="p-5 border-b border-[var(--theme-border)] flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                {title && (
                  <h3
                    id="drawer-title"
                    className="text-base font-black tracking-tight text-[var(--theme-text)] truncate"
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                    {description}
                  </p>
                )}
              </div>
              <IconButton
                icon={<X className="w-4 h-4" />}
                label="Close drawer"
                size="sm"
                variant="ghost"
                onClick={onClose}
              />
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

