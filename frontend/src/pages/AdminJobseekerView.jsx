import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Calendar,
  ExternalLink,
  Shield,
  ShieldAlert,
  ArrowLeft,
  GraduationCap,
  Award,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import CompanyDisplay from "../components/CompanyDisplay";
import AdminConfirmDialog from "../components/admin/AdminConfirmDialog";

export default function AdminJobseekerView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobseeker, setJobseeker] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    variant: "danger",
    action: null,
    loading: false,
  });

  useEffect(() => {
    fetchJobseekerData();
  }, [id]);

  const getAdminToken = () => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "null");
      return adminInfo?.token || null;
    } catch {
      return null;
    }
  };

  const fetchJobseekerData = async () => {
    try {
      const token = getAdminToken();
      if (!token) {
        navigate("/admin/login");
        return;
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/admin/users/${id}/applications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobseeker(data.user);
      setApplications(data.applications || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load candidate dossier.");
      navigate("/admin/dashboard?tab=allJobseekers");
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeToggle = () => {
    if (!jobseeker) return;
    const isCurrentlyFrozen = jobseeker.isFrozen;

    setConfirmDialog({
      isOpen: true,
      title: `${isCurrentlyFrozen ? "Unfreeze" : "Freeze"} Candidate Account`,
      message: `Are you sure you want to ${
        isCurrentlyFrozen ? "restore active status for" : "suspend authentication and access for"
      } ${jobseeker.name || "this candidate"}?`,
      confirmText: isCurrentlyFrozen ? "Unfreeze Account" : "Freeze Account",
      variant: isCurrentlyFrozen ? "success" : "danger",
      loading: false,
      action: async () => {
        try {
          const token = getAdminToken();
          await axios.put(
            `${API_BASE_URL}/admin/freeze-user/${jobseeker._id}`,
            { freeze: !isCurrentlyFrozen },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setJobseeker((prev) => ({ ...prev, isFrozen: !isCurrentlyFrozen }));
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        } catch (err) {
          alert(err.response?.data?.message || "Failed to update freeze status.");
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col justify-center items-center">
        <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center mb-3">
          <Loader2 className="animate-spin text-[var(--theme-text)]" size={20} />
        </div>
        <p className="text-xs font-mono font-medium text-[var(--theme-text-muted)]">
          Retrieving Candidate Dossier...
        </p>
      </div>
    );
  }

  if (!jobseeker) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col justify-center items-center p-4">
        <div className="text-center max-w-sm">
          <ShieldAlert size={36} className="mx-auto text-rose-500 mb-2" />
          <h2 className="text-lg font-bold text-[var(--theme-text)] font-display">Candidate Record Not Found</h2>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1 mb-4">
            The requested candidate profile may have been removed or is inaccessible.
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard?tab=allJobseekers")}
            className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-mono text-xs font-bold cursor-pointer"
          >
            Return to User Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--theme-text-muted)]">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard?tab=allJobseekers")}
              className="hover:text-[var(--theme-text)] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>User Directory</span>
            </button>
            <span>/</span>
            <span className="text-[var(--theme-text)] font-semibold truncate max-w-xs">
              {jobseeker.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFreezeToggle}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs ${
                jobseeker.isFrozen
                  ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {jobseeker.isFrozen ? "Restore Account (Unfreeze)" : "Freeze Account Access"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard?tab=allJobseekers")}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Executive Candidate Header Banner */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center font-display font-extrabold text-2xl text-[var(--theme-text)] shrink-0 shadow-xs">
              {jobseeker.name ? jobseeker.name.charAt(0).toUpperCase() : <User size={28} />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-[var(--theme-text)] truncate">
                  {jobseeker.name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                    jobseeker.isFrozen
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {jobseeker.isFrozen ? "Frozen" : "Active"}
                </span>
                {jobseeker.isVerified && (
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Verified
                  </span>
                )}
                {jobseeker.isProfileComplete && (
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Profile 100% Complete
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-1 font-mono truncate">
                Candidate Account ID: {jobseeker._id}
              </p>
            </div>
          </div>

          {jobseeker.resume && (
            <div className="shrink-0">
              <a
                href={jobseeker.resume}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-mono text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs"
              >
                <FileText size={14} />
                <span>Download Resume</span>
              </a>
            </div>
          )}
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Dossier Details (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Contact & Registration */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5">
                Authentication & Contact
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Mail size={13} /> Email
                  </span>
                  <span className="text-[var(--theme-text)] font-semibold select-all">
                    {jobseeker.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Phone size={13} /> Phone
                  </span>
                  <span className="text-[var(--theme-text)]">
                    {jobseeker.phone || "Not Provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <User size={13} /> Gender
                  </span>
                  <span className="text-[var(--theme-text)]">
                    {jobseeker.gender || "Not Specified"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Calendar size={13} /> Member Since
                  </span>
                  <span className="text-[var(--theme-text)]">
                    {jobseeker.createdAt ? new Date(jobseeker.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            {jobseeker.skills && jobseeker.skills.length > 0 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5">
                  Core Skills ({jobseeker.skills.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {jobseeker.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education Summary */}
            {jobseeker.education && jobseeker.education.length > 0 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5 flex items-center gap-1.5">
                  <GraduationCap size={14} /> Education Background
                </h3>
                <div className="space-y-3">
                  {jobseeker.education.map((edu, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono">
                      <p className="font-bold text-[var(--theme-text)]">{edu.degree || "Degree"}</p>
                      <p className="text-[var(--theme-text-muted)] mt-0.5">{edu.university || edu.institution || "Institution"}</p>
                      {(edu.ended || edu.CGPA) && (
                        <p className="text-[11px] text-[var(--theme-text-muted)] mt-1">
                          {edu.ended && `Year: ${edu.ended}`} {edu.CGPA && `• CGPA: ${edu.CGPA}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Applications & Experience (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Platform Applications Table */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
                <div>
                  <h3 className="text-base font-bold font-display tracking-tight text-[var(--theme-text)] flex items-center gap-2">
                    <Briefcase size={16} /> Platform Applications ({applications.length})
                  </h3>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                    Chronological submission history across registered job listings
                  </p>
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="p-8 rounded-xl bg-[var(--theme-surface-elevated)] border border-dashed border-[var(--theme-border)] text-center text-xs font-mono text-[var(--theme-text-muted)]">
                  Zero applications logged in the system for this candidate.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-[var(--theme-border-silver)] transition-colors"
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-[var(--theme-text)] text-sm truncate">
                          {app.job_id?.title || "Position Listing"}
                        </h4>
                        <div className="text-[11px] font-mono text-[var(--theme-text-muted)] mt-1 flex flex-wrap items-center gap-1.5">
                          <span>{app.job_id?.postedByCompany || app.job_id?.postedByName || "Company Confidential"}</span>
                          <span>•</span>
                          <span>{typeof app.job_id?.location === "object" ? app.job_id?.location?.address || "Remote" : app.job_id?.location || "Remote"}</span>
                          <span>•</span>
                          <span>Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recent"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
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
                            className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-[var(--theme-text)] font-mono text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <span>Inspect Job</span>
                            <ExternalLink size={11} />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Experience / Projects if available */}
            {jobseeker.experience && jobseeker.experience.length > 0 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5 flex items-center gap-1.5">
                  <Briefcase size={14} /> Professional Work History
                </h3>
                <div className="space-y-3">
                  {jobseeker.experience.map((exp, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--theme-text)]">{exp.role || "Role"}</span>
                        <span className="text-[var(--theme-text-muted)]">{exp.duration || "Duration"}</span>
                      </div>
                      <p className="text-[var(--theme-text-muted)] mt-0.5">{exp.company || "Company"}</p>
                      {exp.description && (
                        <p className="text-[11px] text-[var(--theme-text)] opacity-80 mt-2 font-sans">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        loading={confirmDialog.loading}
      />
    </div>
  );
}