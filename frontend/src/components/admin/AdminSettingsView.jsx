import React, { useState } from "react";
import axios from "axios";
import {
  Settings,
  User,
  ShieldCheck,
  Shield,
  Bell,
  Sliders,
  Moon,
  Sun,
  Monitor,
  Check,
  X,
  Plus,
  Trash2,
  Key,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { useTheme } from "../../routes/Context";

export default function AdminSettingsView({
  adminInfo = {},
  allAdmins = [],
  onRefresh,
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState("profile"); // "profile" | "platform" | "notifications" | "team" | "appearance"

  // Platform policy states (persisted in localStorage)
  const [platformConfig, setPlatformConfig] = useState(() => {
    try {
      const stored = localStorage.getItem("jobone_admin_platform_config");
      return stored
        ? JSON.parse(stored)
        : {
            requireJobApproval: true,
            strictKycEnforcement: true,
            autoExpireJobsDays: 60,
            publicDirectoryEnabled: true,
            emailAlertsEnabled: true,
            dailyDigestEnabled: false,
          };
    } catch {
      return {
        requireJobApproval: true,
        strictKycEnforcement: true,
        autoExpireJobsDays: 60,
        publicDirectoryEnabled: true,
        emailAlertsEnabled: true,
        dailyDigestEnabled: false,
      };
    }
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Admin Team Management State (SuperAdmin only)
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employerAdmin",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editRole, setEditRole] = useState("employerAdmin");
  const [roleLoading, setRoleLoading] = useState(false);

  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isSuperAdmin = adminInfo?.role === "superAdmin";

  const handleSavePlatformConfig = () => {
    try {
      localStorage.setItem("jobone_admin_platform_config", JSON.stringify(platformConfig));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (_e) {
      alert("Failed to persist platform preferences.");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    try {
      const token = adminInfo?.token;
      await axios.post(
        `${API_BASE_URL}/admin/create-admin`,
        newAdminData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreateAdminOpen(false);
      setNewAdminData({ name: "", email: "", password: "", role: "employerAdmin" });
      if (onRefresh) onRefresh();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create administrator");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingAdmin) return;
    setRoleLoading(true);
    try {
      const token = adminInfo?.token;
      await axios.patch(
        `${API_BASE_URL}/admin/${editingAdmin._id}/role`,
        { role: editRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingAdmin(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update admin role");
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    setDeleteLoading(true);
    try {
      const token = adminInfo?.token;
      await axios.delete(
        `${API_BASE_URL}/admin/${deletingAdmin._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeletingAdmin(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete administrator");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── Top Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--theme-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-accent-silver)]">
              <Settings size={18} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
                Settings Centre & Governance
              </h1>
              <p className="text-xs text-[var(--theme-text-muted)]">
                Administrator authentication profile, platform operational rules, and RBAC team permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sub-Tabs Navigation Strip ─────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[var(--theme-border)] pb-2 overflow-x-auto">
        {[
          { id: "profile", label: "Executive Profile", icon: User },
          { id: "platform", label: "Platform Governance", icon: Sliders },
          { id: "notifications", label: "Alert Dispatches", icon: Bell },
          { id: "team", label: "Admin RBAC Team", icon: Shield, superOnly: true },
          { id: "appearance", label: "Interface & Theme", icon: Monitor },
        ]
          .filter((tab) => !tab.superOnly || isSuperAdmin)
          .map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-xs"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-[#C0C0C0]" : ""} />
                <span>{tab.label}</span>
              </button>
            );
          })}
      </div>

      {/* ─── SUB-TAB 1: EXECUTIVE PROFILE ───────────────────────────────── */}
      {activeSubTab === "profile" && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold font-display text-[var(--theme-text)]">
                Active Administrator Session
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Authenticated executive credentials and role-based clearance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-1">
                <span className="text-[var(--theme-text-muted)] block text-[10px] uppercase">
                  Full Name
                </span>
                <span className="font-bold text-[var(--theme-text)] text-sm">
                  {adminInfo?.name || "Executive User"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-1">
                <span className="text-[var(--theme-text-muted)] block text-[10px] uppercase">
                  Verified Email
                </span>
                <span className="font-semibold text-[var(--theme-text)] select-all truncate block">
                  {adminInfo?.email}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-1">
                <span className="text-[var(--theme-text-muted)] block text-[10px] uppercase">
                  Assigned RBAC Role
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold uppercase text-[10px] inline-block">
                  {adminInfo?.role}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-1">
                <span className="text-[var(--theme-text-muted)] block text-[10px] uppercase">
                  Session Token Status
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active 30-Day JWT Session
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text-muted)] space-y-1.5">
              <span className="text-[var(--theme-text)] font-bold flex items-center gap-1.5">
                <Lock size={13} className="text-[#C0C0C0]" />
                Credential Modification Guard
              </span>
              <p>
                To maintain regulatory compliance and non-repudiation, administrative credential modifications and password resets must be executed through the secure CLI or by a designated Super Administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 2: PLATFORM GOVERNANCE ─────────────────────────────── */}
      {activeSubTab === "platform" && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold font-display text-[var(--theme-text)]">
                Platform Rules & Moderation Standards
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Configure operational defaults for job publishing and employer verification
              </p>
            </div>

            <div className="space-y-4">
              {/* Toggle 1: Job Approval */}
              <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-xs text-[var(--theme-text)] block">
                    Mandatory Administrative Job Moderation
                  </span>
                  <span className="text-[11px] text-[var(--theme-text-muted)] block mt-0.5">
                    When active, all newly posted job requisitions remain in pending_approval status until an administrator explicitly reviews them.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={platformConfig.requireJobApproval}
                  onChange={(e) =>
                    setPlatformConfig((p) => ({ ...p, requireJobApproval: e.target.checked }))
                  }
                  className="w-4 h-4 rounded-sm border-[var(--theme-border)] accent-[var(--theme-text)] cursor-pointer"
                />
              </div>

              {/* Toggle 2: Strict KYC */}
              <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-xs text-[var(--theme-text)] block">
                    Strict Employer KYC Enforcement
                  </span>
                  <span className="text-[11px] text-[var(--theme-text-muted)] block mt-0.5">
                    Require corporate legal documents (GST, PAN, Aadhar) before granting employers permission to contact candidate talent.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={platformConfig.strictKycEnforcement}
                  onChange={(e) =>
                    setPlatformConfig((p) => ({ ...p, strictKycEnforcement: e.target.checked }))
                  }
                  className="w-4 h-4 rounded-sm border-[var(--theme-border)] accent-[var(--theme-text)] cursor-pointer"
                />
              </div>

              {/* Toggle 3: Public Directory */}
              <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-xs text-[var(--theme-text)] block">
                    Public Companies Showcase Indexing
                  </span>
                  <span className="text-[11px] text-[var(--theme-text-muted)] block mt-0.5">
                    Allow approved employer profiles to appear in the public Explore Companies portal.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={platformConfig.publicDirectoryEnabled}
                  onChange={(e) =>
                    setPlatformConfig((p) => ({ ...p, publicDirectoryEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded-sm border-[var(--theme-border)] accent-[var(--theme-text)] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSavePlatformConfig}
                className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Save Platform Rules</span>
                {saveSuccess && <Check size={14} className="text-emerald-400" />}
              </button>

              {saveSuccess && (
                <span className="text-xs font-mono text-emerald-400 font-bold animate-in fade-in">
                  Platform preferences successfully persisted
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 3: ALERTS & NOTIFICATIONS ──────────────────────────── */}
      {activeSubTab === "notifications" && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold font-display text-[var(--theme-text)]">
                Operational Alert Dispatches
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Configure notifications delivered to executive dashboards
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-xs text-[var(--theme-text)] block">
                    Immediate Job Moderation Alerts
                  </span>
                  <span className="text-[11px] text-[var(--theme-text-muted)] block mt-0.5">
                    Trigger urgent alert badges when an employer submits a new job requisition.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={platformConfig.emailAlertsEnabled}
                  onChange={(e) =>
                    setPlatformConfig((p) => ({ ...p, emailAlertsEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded-sm border-[var(--theme-border)] accent-[var(--theme-text)] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-xs text-[var(--theme-text)] block">
                    Daily Executive Platform Digest
                  </span>
                  <span className="text-[11px] text-[var(--theme-text-muted)] block mt-0.5">
                    Aggregate total candidate applications, pending KYC files, and new registrations into a consolidated daily digest.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={platformConfig.dailyDigestEnabled}
                  onChange={(e) =>
                    setPlatformConfig((p) => ({ ...p, dailyDigestEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded-sm border-[var(--theme-border)] accent-[var(--theme-text)] cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSavePlatformConfig}
              className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              Save Alert Preferences
            </button>
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 4: ADMIN TEAM (SUPERADMIN ONLY) ─────────────────────── */}
      {activeSubTab === "team" && isSuperAdmin && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold font-display text-[var(--theme-text)]">
                  Platform Administrators & RBAC Roster
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Super Administrator authority to assign roles and provision administrative access
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCreateAdminOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Provision Admin</span>
              </button>
            </div>

            {/* Admin Table */}
            <div className="overflow-x-auto border border-[var(--theme-border)] rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/60 text-[var(--theme-text-muted)] text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--theme-border)]">
                  {allAdmins.map((adm) => (
                    <tr key={adm._id} className="hover:bg-[var(--theme-surface-hover)]">
                      <td className="py-3 px-4 font-bold text-[var(--theme-text)]">{adm.name}</td>
                      <td className="py-3 px-4 text-[var(--theme-text-muted)]">{adm.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold uppercase">
                          {adm.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAdmin(adm);
                              setEditRole(adm.role);
                            }}
                            className="text-xs text-[var(--theme-text)] hover:underline cursor-pointer"
                          >
                            Change Role
                          </button>
                          {adm.role !== "superAdmin" && (
                            <button
                              type="button"
                              onClick={() => setDeletingAdmin(adm)}
                              className="p-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Delete Admin"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 5: APPEARANCE & THEME (RULE[user_global]) ──────────── */}
      {activeSubTab === "appearance" && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold font-display text-[var(--theme-text)]">
                Interface Color Scheme
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Strict 3-theme matrix compliance per platform global rules: Dark, Light, and System Default
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Dark */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-[#050505] border-[#FFFFFF] shadow-md ring-2 ring-[var(--theme-text)]/20"
                    : "bg-[#050505] border-[#262626] hover:border-[#404040]"
                }`}
              >
                <div className="flex items-center justify-between mb-3 text-white">
                  <Moon size={18} />
                  {theme === "dark" && <Check size={16} className="text-white" />}
                </div>
                <h4 className="font-bold text-sm text-white font-display">Deep Carbon (Dark)</h4>
                <p className="text-[11px] text-[#A3A3A3] mt-1 font-mono">
                  #050505 canvas with #111111 surfaces and pure silver accents
                </p>
              </button>

              {/* Light */}
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  theme === "light"
                    ? "bg-[#FFFFFF] border-[#0F172A] shadow-md ring-2 ring-[var(--theme-text)]/20"
                    : "bg-[#FFFFFF] border-[#E5E7EB] hover:border-[#94A3B8]"
                }`}
              >
                <div className="flex items-center justify-between mb-3 text-neutral-900">
                  <Sun size={18} />
                  {theme === "light" && <Check size={16} className="text-neutral-900" />}
                </div>
                <h4 className="font-bold text-sm text-neutral-900 font-display">Crisp Light</h4>
                <p className="text-[11px] text-neutral-600 mt-1 font-mono">
                  High-contrast off-white canvas with clean slate typography
                </p>
              </button>

              {/* System Default */}
              <button
                type="button"
                onClick={() => setTheme("default")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  theme === "default"
                    ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-border-silver)] shadow-md ring-2 ring-[var(--theme-text)]/20"
                    : "bg-[var(--theme-surface)] border-[var(--theme-border)] hover:border-[var(--theme-border-silver)]"
                }`}
              >
                <div className="flex items-center justify-between mb-3 text-[var(--theme-text)]">
                  <Monitor size={18} />
                  {theme === "default" && <Check size={16} className="text-[var(--theme-text)]" />}
                </div>
                <h4 className="font-bold text-sm text-[var(--theme-text)] font-display">
                  System Default
                </h4>
                <p className="text-[11px] text-[var(--theme-text-muted)] mt-1 font-mono">
                  Automatically sync with your operating system preferences
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE ADMIN ────────────────────────────────────────── */}
      {createAdminOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setCreateAdminOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
              <h3 className="font-display font-bold text-sm text-[var(--theme-text)]">
                Provision Platform Administrator
              </h3>
              <button
                type="button"
                onClick={() => setCreateAdminOpen(false)}
                className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              >
                <X size={16} />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[var(--theme-text-muted)] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-hidden focus:border-[var(--theme-border-silver)]"
                />
              </div>

              <div>
                <label className="text-[var(--theme-text-muted)] block mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                  placeholder="admin@jobone.com"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-hidden focus:border-[var(--theme-border-silver)]"
                />
              </div>

              <div>
                <label className="text-[var(--theme-text-muted)] block mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-hidden focus:border-[var(--theme-border-silver)]"
                />
              </div>

              <div>
                <label className="text-[var(--theme-text-muted)] block mb-1">Assigned RBAC Role</label>
                <select
                  value={newAdminData.role}
                  onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-hidden focus:border-[var(--theme-border-silver)] cursor-pointer"
                >
                  <option value="employerAdmin">Employer & Jobs Admin</option>
                  <option value="jobseekerAdmin">Candidate Talent Admin</option>
                  <option value="superAdmin">Super Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateAdminOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {createLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT ROLE ───────────────────────────────────────────── */}
      {editingAdmin && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setEditingAdmin(null)}
        >
          <div
            className="w-full max-w-sm bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-sm text-[var(--theme-text)]">
              Update Administrator Role
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] font-mono">
              Admin: {editingAdmin.name} ({editingAdmin.email})
            </p>

            <div className="space-y-2 text-xs font-mono">
              <label className="text-[var(--theme-text-muted)] block">Select New Role:</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-hidden focus:border-[var(--theme-border-silver)] cursor-pointer"
              >
                <option value="employerAdmin">Employer & Jobs Admin</option>
                <option value="jobseekerAdmin">Candidate Talent Admin</option>
                <option value="superAdmin">Super Administrator</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="px-3 py-1.5 rounded-xl border border-[var(--theme-border)] text-[var(--theme-text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={roleLoading}
                onClick={handleUpdateRole}
                className="px-3 py-1.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold hover:opacity-90 disabled:opacity-50"
              >
                {roleLoading ? "Saving..." : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: DELETE ADMIN ─────────────────────────────────────────── */}
      {deletingAdmin && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setDeletingAdmin(null)}
        >
          <div
            className="w-full max-w-sm bg-[var(--theme-surface)] rounded-2xl border border-rose-500/30 shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-[var(--theme-text)]">
                  Revoke Admin Access
                </h3>
                <p className="text-[11px] font-mono text-[var(--theme-text-muted)]">
                  Irreversible security intervention
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--theme-text-muted)] font-mono leading-relaxed">
              Are you sure you want to permanently delete administrator account{" "}
              <strong className="text-[var(--theme-text)]">{deletingAdmin.name}</strong> ({deletingAdmin.email})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDeletingAdmin(null)}
                className="px-3 py-1.5 rounded-xl border border-[var(--theme-border)] text-[var(--theme-text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAdmin}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 disabled:opacity-50"
              >
                {deleteLoading ? "Revoking..." : "Revoke Access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

