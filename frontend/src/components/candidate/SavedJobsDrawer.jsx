import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bookmark,
  X,
  Building2,
  MapPin,
  Briefcase,
  Trash2,
  ArrowRight,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function SavedJobsDrawer({
  isOpen,
  onClose,
  onOpenJobDetails,
}) {
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const navigate = useNavigate();

  // Prevent background page scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Load saved IDs whenever drawer opens
  useEffect(() => {
    if (!isOpen) {
      setShowClearConfirm(false);
      return;
    }

    try {
      const stored = localStorage.getItem("jobone_saved_jobs");
      const ids = stored ? JSON.parse(stored) : [];
      setSavedJobIds(ids);

      if (ids.length > 0) {
        setLoading(true);
        axios
          .get(`${API_BASE_URL}/jobs?limit=100`)
          .then((res) => {
            const allJobs = res.data?.data || res.data || [];
            const filtered = allJobs.filter((job) => ids.includes(job._id));
            setJobs(filtered);
          })
          .catch((err) => {
            console.error("Failed to load saved jobs details", err);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setJobs([]);
      }
    } catch {
      setSavedJobIds([]);
      setJobs([]);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleRemove = (jobId, e) => {
    e.stopPropagation();
    const updated = savedJobIds.filter((id) => id !== jobId);
    setSavedJobIds(updated);
    setJobs((prev) => prev.filter((j) => j._id !== jobId));
    try {
      localStorage.setItem("jobone_saved_jobs", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Failed to update saved jobs", err);
    }
  };

  const handleClearAll = () => {
    try {
      localStorage.setItem("jobone_saved_jobs", JSON.stringify([]));
      setSavedJobIds([]);
      setJobs([]);
      setShowClearConfirm(false);
      window.dispatchEvent(new Event("storage"));
    } catch (_err) {
      /* ignore */
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-jobs-title"
      className="fixed inset-0 z-[90] flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden"
    >
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Slide-out Drawer Canvas (Responsive width without horizontal overflow) */}
      <div className="relative w-full max-w-[100vw] sm:max-w-md sm:w-[440px] h-full bg-[var(--theme-surface)] text-[var(--theme-text)] border-l border-[var(--theme-border)] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--theme-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)] shrink-0">
              <Bookmark size={18} />
            </div>
            <div className="min-w-0">
              <h2 id="saved-jobs-title" className="text-base sm:text-lg font-bold tracking-tight text-[var(--theme-text)] truncate">
                Saved Opportunities
              </h2>
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">
                {savedJobIds.length} {savedJobIds.length === 1 ? "role" : "roles"} bookmarked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)] shrink-0"
            aria-label="Close saved opportunities drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-3.5 scrollbar-thin">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent-silver)] mb-3" />
              <p className="text-xs text-[var(--theme-text-muted)] font-mono uppercase tracking-wider">
                Loading saved positions...
              </p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-muted)] mb-4 shadow-sm">
                <Bookmark size={26} />
              </div>
              <h3 className="font-bold text-base text-[var(--theme-text)] mb-1">
                No Saved Jobs Yet
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] max-w-xs mb-6 leading-relaxed">
                Bookmark job listings while exploring roles so you can compare, review, and apply to them later.
              </p>
              <Link
                to="/jobs"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-xs min-h-[40px]"
              >
                Explore Open Roles <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            jobs.map((job) => {
              const companyName = job.postedByCompany || job.postedByName || "Verified Employer";
              const locationStr =
                typeof job.location === "object"
                  ? job.location?.address || "Remote"
                  : job.location || "Remote";
              const salaryStr = job.salary
                ? `₹${Number(job.salary).toLocaleString()}`
                : "Compensation on Request";

              return (
                <div
                  key={job._id}
                  onClick={() => {
                    if (onOpenJobDetails) {
                      onOpenJobDetails(job);
                    } else {
                      navigate(`/apply/${job._id}`);
                      onClose();
                    }
                  }}
                  className="group relative p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] hover:border-[var(--theme-border-silver)] transition-all cursor-pointer shadow-xs"
                >
                  {/* Card Header: Title & Remove */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-bold text-sm tracking-tight text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver)] transition-colors line-clamp-1 flex-1">
                      {job.title}
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => handleRemove(job._id, e)}
                      title="Remove from saved"
                      className="text-[var(--theme-text-muted)] hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                      aria-label={`Remove ${job.title} from saved`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Company */}
                  <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)] mb-3">
                    <Building2 size={13} className="text-[var(--theme-accent-silver)] shrink-0" />
                    <span className="truncate">{companyName}</span>
                  </div>

                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[var(--theme-text-muted)] mb-3.5">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-[var(--theme-accent-silver)] shrink-0" />
                      <span className="truncate max-w-[120px]">{locationStr}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={11} className="text-[var(--theme-accent-silver)] shrink-0" />
                      <span>{job.jobType || "Full-time"}</span>
                    </span>
                    <span className="font-mono text-[var(--theme-text)] font-semibold">
                      {salaryStr}
                    </span>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[var(--theme-border)] text-[11px]">
                    <span className="text-[var(--theme-accent-silver)] font-medium group-hover:underline flex items-center gap-1">
                      View details <ArrowRight size={11} />
                    </span>
                    <Link
                      to={`/apply/${job._id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-[11px] hover:opacity-90 transition-opacity shadow-xs"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {jobs.length > 0 && (
          <div className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] shrink-0">
            {showClearConfirm ? (
              <div className="flex items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text)]">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span>Clear all {jobs.length} jobs?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2.5 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Link
                  to="/jobs"
                  onClick={onClose}
                  className="text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-medium transition-colors flex items-center gap-1"
                >
                  Browse more jobs <ExternalLink size={12} />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-red-500 hover:text-red-400 hover:underline font-medium transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
