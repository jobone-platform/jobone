import React from "react";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone. Please confirm to proceed.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // "danger" | "warning" | "info"
  loading = false,
}) {
  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-rose-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    info: <Info className="w-6 h-6 text-blue-400" />,
  };

  const buttonVariants = {
    danger: "danger",
    warning: "primary",
    info: "silver",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={false}>
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] flex items-center justify-center">
          {icons[variant] || icons.danger}
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-[var(--theme-text)]">
            {title}
          </h3>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1.5 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={buttonVariants[variant] || "danger"}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

