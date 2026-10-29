import React, { useEffect } from "react";
import {
  Settings,
  X,
  Shield,
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
      "Full platform oversight and dashboard metrics",
      "Approve & reject job postings",
      "Verify & approve employer accounts",
      "Freeze and unfreeze any user or employer",
      "Create, promote, and remove administrators",
      "Full database export to Excel (all collections)",
    ],
    employerAdmin: [
      "Review & approve pending jobs",
      "Verify employer profiles and business documents",
      "Freeze and unfreeze employers",
      "Export employer and job data to Excel",
    ],
    jobseekerAdmin: [
      "Review jobseeker candidates & applications",
      "Freeze and unfreeze candidate accounts",
      "Search candidates directory",
      "Export jobseeker profile data to Excel",
    ],
  };

  const activePerms = rolePerms[adminInfo?.role] || rolePerms.superAdmin;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Settings size={18} />
            </div>
            <div>
              <h3 id="settings-title" className="text-base font-bold text-slate-900 dark:text-white">
                Admin Center Settings
              </h3>
              <p className="text-xs text-slate-400">
                Identity, RBAC permissions, and display preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Identity Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Authenticated Session
            </span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                {(adminInfo?.name || "A").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {adminInfo?.name || "Administrator"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {adminInfo?.email || "admin@jobone.com"}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                    <Shield size={10} />
                    {roleNameMap[adminInfo?.role] || adminInfo?.role || "Super Admin"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Preference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Appearance & Theme
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { key: "light", label: "Light", icon: Sun },
                { key: "dark", label: "Dark", icon: Moon },
                { key: "default", label: "System", icon: Monitor },
              ].map(({ key, label, icon: Icon }) => {
                const isSelected = theme === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-bold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Permissions Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Assigned RBAC Privileges
              </label>
              <span className="text-[10px] font-semibold text-slate-400">
                Server-enforced
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
              {activePerms.map((perm, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

