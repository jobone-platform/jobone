import React from "react";
import {
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers,
  Award,
} from "lucide-react";

export default function ResumeSyncModal({
  isOpen,
  onClose,
  onConfirm,
  saving,
  resumeData,
}) {
  if (!isOpen) return null;

  const itemsToSync = [
    { label: "Personal Headline & Summary", count: resumeData.summary ? "Present" : "Empty", icon: User },
    { label: "Technical Skills Matrix", count: `${(resumeData.skills || []).length} Skills`, icon: Sparkles },
    { label: "Career Work Experience", count: `${(resumeData.experience || []).length} Roles`, icon: Briefcase },
    { label: "Academic Education History", count: `${(resumeData.education || []).length} Degrees`, icon: GraduationCap },
    { label: "Technical Projects", count: `${(resumeData.projects || []).length} Projects`, icon: Layers },
    { label: "Certifications & Credentials", count: `${(resumeData.certifications || []).length} Certs`, icon: Award },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-modal-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--theme-border)] flex items-center justify-between bg-[var(--theme-surface-elevated)]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)]">
              <RefreshCw size={18} />
            </div>
            <div>
              <h3 id="sync-modal-title" className="text-base font-bold text-[var(--theme-text)]">
                Sync Resume to Candidate Dossier
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)]">
                Update your primary profile with edits made in this resume
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer"
            aria-label="Close sync modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-[var(--theme-text-muted)] leading-relaxed">
            Synchronizing will update your public candidate profile and recruiter dossier with the following data sections from this resume:
          </p>

          <div className="space-y-2 rounded-2xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] p-3.5">
            {itemsToSync.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-[var(--theme-border)]/50 last:border-0">
                  <div className="flex items-center gap-2 text-[var(--theme-text)] font-medium">
                    <Icon size={14} className="text-[var(--theme-accent-silver)]" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono text-[var(--theme-accent-silver)] font-bold">{item.count}</span>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Any existing profile descriptions or older entries will be refreshed with the current resume values. Verified document PDFs remain untouched in your Credential Vault.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/50 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin text-[var(--theme-bg)]" />
                <span>Synchronizing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                <span>Confirm & Sync Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

