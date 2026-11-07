import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  X,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Users,
  Shield,
  Layers,
  Loader2,
  FileText,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import CompanyDisplay from "../CompanyDisplay";

export default function AdminJobDetailDrawer({
  jobId,
  isOpen,
  onClose,
  adminToken,
  onReviewJob,
}) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !jobId) {
      setJob(null);
      return;
    }

    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/admin/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setJob(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [isOpen, jobId, adminToken]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleStatusChange = async (status) => {
    setActionLoading(true);
    try {
      if (onReviewJob) {
        await onReviewJob(jobId, status);
      } else {
        await axios.patch(
          `${API_BASE_URL}/admin/jobs/${jobId}/review`,
          { status },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
      }
      setJob((prev) => ({ ...prev, status }));
    } catch {
      alert("Failed to update job status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const locationStr =
    typeof job?.location === "object"
      ? job.location?.address || "Remote"
      : job?.location || "Remote";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[var(--theme-surface)] border-l border-[var(--theme-border)] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[var(--theme-border)] flex items-center justify-between gap-4 bg-[var(--theme-surface-elevated)]/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] flex items-center justify-center font-display font-bold text-base text-[var(--theme-text)] shrink-0">
                <Briefcase size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-base sm:text-lg text-[var(--theme-text)] truncate">
                  {job?.title || "Job Moderation"}
                </h3>
                <p className="font-mono text-xs text-[var(--theme-text-muted)] truncate">
                  ID: {jobId} • {job?.industry || "General Vertical"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/admin/job/${jobId}`}
                className="p-2 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                title="Full Moderation Dossier"
              >
                <ExternalLink size={16} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin text-[var(--theme-text)] mb-3" size={24} />
                <p className="text-xs font-mono text-[var(--theme-text-muted)]">
                  Loading position details...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                {error}
              </div>
            ) : job ? (
              <>
                {/* Moderation Action Banner */}
                <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                          job.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : job.status === "pending_approval" || job.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        Status: {job.status}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--theme-text-muted)]">
                        {job.noOfPeopleRequired || 1} Opening(s)
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[var(--theme-text-muted)] mt-1">
                      Posted by {job.postedByCompany || job.postedByName || "Company Confidential"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.status !== "active" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange("active")}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                    {job.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange("rejected")}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                    {job.status !== "hidden" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange("hidden")}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors cursor-pointer"
                      >
                        Hide
                      </button>
                    )}
                  </div>
                </div>

                {/* Core Parameters */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                    Position Parameters
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
                      <span className="text-[var(--theme-text-muted)] block mb-1">Industry</span>
                      <span className="text-[var(--theme-text)] font-semibold">{job.industry}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
                      <span className="text-[var(--theme-text-muted)] block mb-1">Subdomain</span>
                      <span className="text-[var(--theme-text)] font-semibold">{job.subdomain || "General"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
                      <span className="text-[var(--theme-text-muted)] block mb-1">Location</span>
                      <span className="text-[var(--theme-text)] font-semibold truncate block">{locationStr}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
                      <span className="text-[var(--theme-text-muted)] block mb-1">Compensation</span>
                      <span className="text-[var(--theme-text)] font-semibold">
                        {job.salaryMin === 0 && job.salaryMax === 0
                          ? "Unpaid"
                          : `${job.salaryCurrency || "INR"} ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} / ${job.salaryFrequency || "Month"}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {job.jobSummary && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                      Job Summary
                    </h4>
                    <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] whitespace-pre-wrap leading-relaxed font-sans">
                      {job.jobSummary}
                    </div>
                  </div>
                )}

                {/* Key Responsibilities */}
                {job.keyResponsibilities && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                      Key Responsibilities
                    </h4>
                    <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] whitespace-pre-wrap leading-relaxed font-sans">
                      {job.keyResponsibilities}
                    </div>
                  </div>
                )}

                {/* Skills Required */}
                {job.skillsRequired && job.skillsRequired.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                      Skills Required ({job.skillsRequired.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skillsRequired.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-mono"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/40 flex items-center justify-between gap-3">
            <Link
              to={`/admin/job/${jobId}`}
              className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Full Moderation Dossier</span>
              <ExternalLink size={13} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
