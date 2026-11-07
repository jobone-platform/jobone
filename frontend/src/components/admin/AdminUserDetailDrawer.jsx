import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Layers,
  GraduationCap,
  Loader2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import CompanyDisplay from "../CompanyDisplay";

export default function AdminUserDetailDrawer({
  userId,
  isOpen,
  onClose,
  adminToken,
  onFreezeToggle,
}) {
  const [userData, setUserData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) {
      setUserData(null);
      setApplications([]);
      return;
    }

    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/admin/users/${userId}/applications`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        setUserData(res.data?.user || null);
        setApplications(res.data?.applications || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load candidate details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [isOpen, userId, adminToken]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] flex items-center justify-center font-display font-bold text-base text-[var(--theme-text)] shrink-0">
                {userData?.name ? userData.name.charAt(0).toUpperCase() : <User size={18} />}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-base sm:text-lg text-[var(--theme-text)] truncate">
                  {userData?.name || "Candidate Profile"}
                </h3>
                <p className="font-mono text-xs text-[var(--theme-text-muted)] truncate">
                  ID: {userId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/admin/user/${userId}`}
                className="p-2 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                title="Open Dedicated Full Page"
              >
                <ExternalLink size={16} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin text-[var(--theme-text)] mb-3" size={24} />
                <p className="text-xs font-mono text-[var(--theme-text-muted)]">
                  Retrieving candidate record...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                {error}
              </div>
            ) : userData ? (
              <>
                {/* Account Status Strip */}
                <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                        userData.isFrozen
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {userData.isFrozen ? "Account Frozen" : "Account Active"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${
                        userData.isVerified
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]"
                      }`}
                    >
                      {userData.isVerified ? "Verified Email" : "Unverified"}
                    </span>
                    {userData.isProfileComplete && (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Profile Complete
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onFreezeToggle && onFreezeToggle(userData._id, userData.isFrozen, "user")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      userData.isFrozen
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {userData.isFrozen ? "Unfreeze Account" : "Freeze Account"}
                  </button>
                </div>

                {/* Primary Contact Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                    Contact & Authentication
                  </h4>
                  <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-2.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                        <Mail size={13} /> Email
                      </span>
                      <span className="text-[var(--theme-text)] font-semibold select-all">
                        {userData.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                        <Phone size={13} /> Phone
                      </span>
                      <span className="text-[var(--theme-text)]">
                        {userData.phone || "Not Provided"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                        <Calendar size={13} /> Registered
                      </span>
                      <span className="text-[var(--theme-text)]">
                        {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {userData.skills && userData.skills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                      Skills ({userData.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {userData.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Platform Applications */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] flex items-center gap-1.5">
                      <Briefcase size={13} /> Application History ({applications.length})
                    </h4>
                  </div>

                  {applications.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[var(--theme-surface-elevated)] border border-dashed border-[var(--theme-border)] text-center text-xs font-mono text-[var(--theme-text-muted)]">
                      No applications submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {applications.slice(0, 5).map((app) => (
                        <div
                          key={app._id}
                          className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--theme-text)] truncate">
                              {app.job_id?.title || "Position Listing"}
                            </p>
                            <p className="text-[11px] font-mono text-[var(--theme-text-muted)] truncate mt-0.5">
                              {app.job_id?.postedByCompany || app.job_id?.postedByName || "Company Confidential"} •{" "}
                              {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recent"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                                app.status === "Hired"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : app.status === "Rejected"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : app.status === "Shortlisted"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]"
                              }`}
                            >
                              {app.status || "Applied"}
                            </span>
                            {app.job_id?._id && (
                              <Link
                                to={`/admin/job/${app.job_id._id}`}
                                className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                                title="Inspect Job"
                              >
                                <ExternalLink size={13} />
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 sm:p-5 border-t border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/40 flex items-center justify-between gap-3">
            <Link
              to={`/admin/user/${userId}`}
              className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Full Dossier</span>
              <ExternalLink size={13} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
