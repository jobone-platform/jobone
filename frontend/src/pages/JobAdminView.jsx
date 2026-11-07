import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Users,
  Eye,
  EyeOff,
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  Layers,
  GraduationCap,
  Languages,
  HelpCircle,
  Calendar,
} from "lucide-react";
import CompanyDisplay from "../components/CompanyDisplay";
import AdminConfirmDialog from "../components/admin/AdminConfirmDialog";

export default function JobAdminView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
    fetchJobData();
  }, [id]);

  const getAdminToken = () => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "null");
      return adminInfo?.token || null;
    } catch {
      return null;
    }
  };

  const fetchJobData = async () => {
    try {
      const token = getAdminToken();
      if (!token) {
        navigate("/admin/login");
        return;
      }
      const { data } = await axios.get(`${API_BASE_URL}/admin/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJob(data);
    } catch {
      alert("Failed to load job moderation dossier.");
      navigate("/admin/dashboard?tab=allJobs");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status, stayOnPage = false) => {
    const isApprove = status === "active";
    setConfirmDialog({
      isOpen: true,
      title: `${isApprove ? "Approve & Publish" : status === "rejected" ? "Reject" : "Update"} Position Listing`,
      message: `Are you sure you want to mark this job posting as "${status}"? ${
        isApprove ? "The job will become immediately visible in candidate search." : "The listing status will be updated immediately."
      }`,
      confirmText: isApprove ? "Approve & Publish" : status === "rejected" ? "Reject Job" : "Update Status",
      variant: isApprove ? "success" : "danger",
      loading: false,
      action: async () => {
        setActionLoading(true);
        try {
          const token = getAdminToken();
          await axios.patch(
            `${API_BASE_URL}/admin/jobs/${id}/review`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setJob((prev) => ({ ...prev, status }));
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
          if (!stayOnPage) {
            navigate("/admin/dashboard?tab=allJobs");
          }
        } catch {
          alert("Failed to update job review status.");
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const renderArray = (arr) => {
    if (!arr || arr.length === 0) return "Not specified";
    return arr.join(", ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col justify-center items-center">
        <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center mb-3">
          <Loader2 className="animate-spin text-[var(--theme-text)]" size={20} />
        </div>
        <p className="text-xs font-mono font-medium text-[var(--theme-text-muted)]">
          Retrieving Job Moderation Dossier...
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col justify-center items-center p-4">
        <div className="text-center max-w-sm">
          <ShieldAlert size={36} className="mx-auto text-rose-500 mb-2" />
          <h2 className="text-lg font-bold text-[var(--theme-text)] font-display">Job Listing Not Found</h2>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1 mb-4">
            The requested position listing may have been deleted or is inaccessible.
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard?tab=allJobs")}
            className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-mono text-xs font-bold cursor-pointer"
          >
            Return to Job Directory
          </button>
        </div>
      </div>
    );
  }

  const locationStr =
    typeof job.location === "object"
      ? job.location?.address || "Remote"
      : job.location || "Remote";

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--theme-text-muted)]">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard?tab=allJobs")}
              className="hover:text-[var(--theme-text)] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Job Moderation</span>
            </button>
            <span>/</span>
            <span className="text-[var(--theme-text)] font-semibold truncate max-w-xs">
              {job.title}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/dashboard?tab=allJobs")}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors cursor-pointer w-fit"
          >
            Dashboard
          </button>
        </div>

        {/* Executive Header Banner */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span
                className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                  job.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : job.status === "pending_approval" || job.status === "pending"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {job.status.replace("_", " ")}
              </span>
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)]">
                Job ID: {job._id}
              </span>
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)]">
                • {job.industry}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-display tracking-tight text-[var(--theme-text)]">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center text-xs font-mono text-[var(--theme-text-muted)] gap-3 mt-2">
              <span className="text-[var(--theme-text)] font-semibold">
                <CompanyDisplay job={job} fallback={job.postedByCompany || "Company Confidential"} />
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> Posted {formatDate(job.postedAt || job.createdAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users size={12} /> {job.applicants?.length || 0} Applicant(s)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {job.status !== "active" && (
              <button
                type="button"
                onClick={() => handleStatusChange("active")}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Approve & Publish</span>
              </button>
            )}
            {job.status !== "rejected" && (
              <button
                type="button"
                onClick={() => handleStatusChange("rejected")}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <XCircle size={14} />
                <span>Reject</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Quick Parameters & Organization (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Decision Status Controller */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5">
                Moderation Status
              </h3>
              <div className="space-y-2">
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(e.target.value, true)}
                  disabled={actionLoading}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
                >
                  <option value="active">Active (Published)</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                  <option value="hidden">Hidden</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
                {actionLoading && (
                  <p className="text-[10px] font-mono text-[var(--theme-text-muted)] animate-pulse text-center">
                    Updating moderation state...
                  </p>
                )}
              </div>
            </div>

            {/* Core Parameters */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5">
                Core Parameters
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Briefcase size={13} /> Work Mode & Type
                  </span>
                  <span className="text-[var(--theme-text)] font-semibold text-right">
                    {renderArray(job.jobType)} • {renderArray(job.mode)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <DollarSign size={13} /> Compensation
                  </span>
                  <span className="text-[var(--theme-text)] font-semibold text-right">
                    {job.salaryMin === 0 && job.salaryMax === 0
                      ? "Unpaid / Volunteer"
                      : `${job.salaryCurrency || "INR"} ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} / ${job.salaryFrequency || "Month"}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <MapPin size={13} /> Location
                  </span>
                  <span className="text-[var(--theme-text)] text-right truncate max-w-xs">
                    {locationStr} {job.pinCode ? `(${job.pinCode})` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Users size={13} /> Required Openings
                  </span>
                  <span className="text-[var(--theme-text)]">
                    {job.noOfPeopleRequired || 1} Position(s)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Layers size={13} /> Sector & Subdomain
                  </span>
                  <span className="text-[var(--theme-text)] text-right">
                    {job.industry} / {job.subdomain || "General"}
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule & Shifts */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5">
                Schedule & Shifts
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)]">Work Days Pattern</span>
                  <span className="text-[var(--theme-text)]">
                    {job.workDaysPattern === "Custom"
                      ? job.customWorkDaysDescription || "Custom Pattern"
                      : job.workDaysPattern || "Standard"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)]">Application Deadline</span>
                  <span className="text-[var(--theme-text)]">
                    {formatDate(job.applicationDeadline)}
                  </span>
                </div>
                {job.shifts && job.shifts.length > 0 && (
                  <div className="pt-2 border-t border-[var(--theme-border)] space-y-1.5">
                    <span className="text-[var(--theme-text-muted)] block text-[11px]">Configured Shifts</span>
                    {job.shifts.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between"
                      >
                        <span className="font-semibold text-[var(--theme-text)]">{s.shiftName}</span>
                        <span className="text-[var(--theme-text-muted)]">
                          {s.startTime} - {s.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Employer Link */}
            {job.postedBy && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5 flex items-center gap-1.5">
                  <Building2 size={14} /> Posting Organization
                </h3>
                <p className="text-sm font-bold text-[var(--theme-text)] font-display">
                  {job.postedByCompany || job.postedByName || "Employer Profile"}
                </p>
                <Link
                  to={`/admin/employer/${job.postedBy?._id || job.postedBy}`}
                  className="w-full py-2 px-3 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Inspect Employer KYC Dossier</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Complete Job Content (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Job Summary */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5">
                Executive Position Summary
              </h3>
              <div className="text-xs sm:text-sm text-[var(--theme-text)] whitespace-pre-wrap leading-relaxed font-sans opacity-90">
                {job.jobSummary}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5">
                Key Responsibilities
              </h3>
              <div className="text-xs sm:text-sm text-[var(--theme-text)] whitespace-pre-wrap leading-relaxed font-sans opacity-90">
                {job.keyResponsibilities}
              </div>
            </div>

            {/* Skills Required */}
            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5">
                  Required Competencies & Skills ({job.skillsRequired.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.skillsRequired.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-mono"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Screening Questions */}
            {job.screeningQuestions && job.screeningQuestions.length > 0 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5 flex items-center gap-1.5">
                  <HelpCircle size={14} /> Screening Questions ({job.screeningQuestions.length})
                </h3>
                <div className="space-y-2">
                  {job.screeningQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] flex items-start gap-2"
                    >
                      <span className="font-bold text-[var(--theme-text-muted)]">{idx + 1}.</span>
                      <span>{q}</span>
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