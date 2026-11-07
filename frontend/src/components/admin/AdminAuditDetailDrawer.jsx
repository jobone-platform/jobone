import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Clock,
  User,
  Building2,
  Briefcase,
  FileText,
  ExternalLink,
  Lock,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function AdminAuditDetailDrawer({ event, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const getEntityIcon = (type) => {
    switch (type) {
      case "Job":
        return <Briefcase size={16} />;
      case "Employer":
        return <Building2 size={16} />;
      case "User":
        return <User size={16} />;
      case "Contact":
        return <FileText size={16} />;
      default:
        return <Shield size={16} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "FLAGGED":
      case "BLOCKED":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)]";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[var(--theme-surface)] border-l border-[var(--theme-border)] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-[var(--theme-border)] flex items-center justify-between gap-4 bg-[var(--theme-surface-elevated)]/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-text)] shrink-0">
                {getEntityIcon(event.entityType)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-display text-[var(--theme-text)] truncate">
                    Audit Event Details
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-[var(--theme-text-muted)] truncate">
                  Event ID: {event.id}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
              title="Close drawer (Esc)"
            >
              <X size={16} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Primary Action Banner */}
            <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)] font-bold">
                  Classified Action
                </span>
                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold">
                  {event.category}
                </span>
              </div>
              <p className="text-sm font-bold font-mono text-[var(--theme-text)]">
                {event.action}
              </p>
              <p className="text-xs text-[var(--theme-text-muted)]">
                {event.description || "System security or lifecycle transition recorded in database log."}
              </p>
            </div>

            {/* Actor & Timestamp Profile */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                Actor & Authentication Context
              </h4>
              <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)]">Originating Actor</span>
                  <span className="text-[var(--theme-text)] font-semibold">{event.actor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)]">Actor Role</span>
                  <span className="text-[var(--theme-text)]">{event.actorRole || "System / Executive"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Clock size={13} /> Recorded Timestamp
                  </span>
                  <span className="text-[var(--theme-text)]">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Record Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                Target Record Information
              </h4>
              <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)]">Entity Type</span>
                  <span className="text-[var(--theme-text)] font-semibold">{event.entityType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)]">Entity Identity</span>
                  <span className="text-[var(--theme-text)] font-bold truncate max-w-[220px]">
                    {event.entityTitle || event.targetId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)]">Database ObjectID</span>
                  <span className="text-[var(--theme-text-muted)] select-all truncate max-w-[220px]">
                    {event.targetId || "N/A"}
                  </span>
                </div>

                {event.targetLink && (
                  <div className="pt-2 border-t border-[var(--theme-border)]">
                    <Link
                      to={event.targetLink}
                      className="px-3 py-1.5 rounded-lg bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Open Associated Dossier</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* State Transition / Payload Details */}
            {event.metadata && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                  Event Telemetry & Metadata
                </h4>
                <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
                  <pre className="text-[11px] font-mono text-[var(--theme-text-muted)] whitespace-pre-wrap break-all overflow-x-auto">
                    {typeof event.metadata === "object"
                      ? JSON.stringify(event.metadata, null, 2)
                      : String(event.metadata)}
                  </pre>
                </div>
              </div>
            )}

            {/* Immutability Notice */}
            <div className="p-3.5 rounded-xl bg-[var(--theme-surface)] border border-dashed border-[var(--theme-border)] flex items-start gap-2.5 text-xs font-mono text-[var(--theme-text-muted)]">
              <Lock size={15} className="shrink-0 mt-0.5 text-[#C0C0C0]" />
              <p>
                This audit log is verified immutable. Administrative deletion or client-side tampering is strictly blocked by platform governance policies.
              </p>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 sm:p-5 border-t border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/40 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-[var(--theme-text-muted)]">
              Verified Administrative Audit Record
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

