import React, { useEffect } from "react";
import {
  Settings,
  X,
  ShieldCheck,
  User,
  Key,
  Database,
  Moon,
  Sun,
  Monitor,
  Check,
  Lock,
} from "lucide-react";
import { useTheme } from "../../routes/Context";

export default function AdminSettingsModal({
  isOpen,
  onClose,
  adminInfo = {},
}) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roleNameMap = {
    superAdmin: "Super Administrator",
    employerAdmin: "Employer & Jobs Administrator",
    jobseekerAdmin: "Jobseeker & Candidates Administrator",
  };

  const rolePerms = {
    superAdmin: [
      "Full platform oversight and executive control center",
      "Approve & reject job postings across all sectors",
      "Verify & approve employer accounts and review KYC documents",
      "Freeze and unfreeze any candidate or employer account",
      "Create, promote, and remove platform administrators",
      "Full database export to Excel (all collections)",
    ],
    employerAdmin: [
      "Review & approve pending job postings",
      "Verify employer profiles and business documents",
      "Freeze and unfreeze employers",
      "Export employer and job data to Excel",
    ],
    jobseekerAdmin: [
      "Review candidate profiles & applications",
      "Freeze and unfreeze candidate accounts",
      "Search candidates directory",
      "Export jobseeker profile data to Excel",
    ],
  };

  const currentRole = adminInfo?.role || "superAdmin";
  const permissions = rolePerms[currentRole] || rolePerms.superAdmin;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--theme-border)] flex items-center justify-between bg-[var(--theme-surface-elevated)]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-accent-silver)] flex items-center justify-center">
              <Settings size={18} />
            </div>
            <div>
              <h3 id="settings-title" className="text-sm font-bold text-[var(--theme-text)]">
                Admin Workspace Settings
              </h3>
              <p className="text-[11px] text-[var(--theme-text-muted)]">
                Account identity, RBAC authorization, and interface preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Identity Card */}
          <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/60 border border-[var(--theme-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-[var(--theme-text-subtle)] font-bold">
                Identity Profile
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--theme-surface)] text-[var(--theme-accent-silver)] border border-[var(--theme-border-silver)]">
                {roleNameMap[currentRole]}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[11px] text-[var(--theme-text-muted)]">Full Name</p>
                <p className="font-bold text-[var(--theme-text)] mt-0.5">{adminInfo?.name || "Administrator"}</p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--theme-text-muted)]">Account Email</p>
                <p className="font-mono text-[var(--theme-text)] mt-0.5 truncate">{adminInfo?.email || "admin@jobone.com"}</p>
              </div>
            </div>
          </div>

          {/* Theme Settings (RULE[user_global]: Dark, Light, Default) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--theme-text)]">
              Interface Theme Standard
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                  theme === "dark"
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)] shadow-sm"
                    : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border-[var(--theme-border)] hover:bg-[var(--theme-surface-hover)]"
                }`}
              >
                <Moon size={16} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                  theme === "light"
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)] shadow-sm"
                    : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border-[var(--theme-border)] hover:bg-[var(--theme-surface-hover)]"
                }`}
              >
                <Sun size={16} />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("default")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                  theme === "default"
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)] shadow-sm"
                    : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border-[var(--theme-border)] hover:bg-[var(--theme-surface-hover)]"
                }`}
              >
                <Monitor size={16} />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* RBAC Capabilities */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[var(--theme-accent-silver)]" />
              <span className="text-xs font-bold text-[var(--theme-text)]">Active Capabilities & Permissions</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[var(--theme-text-muted)]">
              {permissions.map((perm, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[var(--theme-surface-elevated)]/40 p-2 rounded-lg border border-[var(--theme-border)]/60">
                  <Check size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[var(--theme-surface-muted)]/50 border-t border-[var(--theme-border)] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
