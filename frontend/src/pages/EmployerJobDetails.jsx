import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import EmployerLayout from "../components/employer/EmployerLayout.jsx";
import {
  Pencil,
  Trash2,
  Loader2,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  CheckCircle2,
  Zap,
  GraduationCap,
  Languages,
  UserCircle2,
  HelpCircle,
  ListChecks,
  Target,
  Power,
  ChevronRight,
  ArrowLeft,
  Building,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from "lucide-react";

export default function EmployerJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) return navigate("/login");
        const token = JSON.parse(stored)?.token;
        if (!token) return navigate("/login");

        const { data } = await axios.get(`${API_BASE_URL}/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJob(data.job || data);
      } catch (err) {
        console.error("Failed to load job details:", err);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job listing? This will permanently remove the role and its associated pipeline."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const token = JSON.parse(localStorage.getItem("employerInfo"))?.token;
      await axios.delete(`${API_BASE_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Job posting removed successfully.");
      navigate("/employerdashboard");
    } catch (err) {
      alert("Failed to delete job: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!job) return;
    if (job.status === "pending_approval" || job.status === "rejected") {
      alert("Action Denied: You cannot toggle a job that is pending admin approval or rejected.");
      return;
    }

    try {
      setTogglingStatus(true);
      const newStatus = job.status === "active" ? "closed" : "active";
      const token = JSON.parse(localStorage.getItem("employerInfo"))?.token;

      await axios.put(
        `${API_BASE_URL}/jobs/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJob((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setTogglingStatus(false);
    }
  };

  const renderArray = (val) => {
    if (!val) return "Not specified";
    if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "Not specified";
    return String(val);
  };

  const renderExperience = () => {
    if (!job?.experience) return "Not specified";
    const rel = job.experience.relevantExperience;
    const tot = job.experience.totalExperience;
    if (rel?.isAny && tot?.isAny) return "Any / Freshers Welcome";
    if (!rel?.isAny && rel?.min !== undefined && rel?.min !== "")
      return `${rel.min} - ${rel.max} yrs (Relevant)`;
    if (!tot?.isAny && tot?.min !== undefined && tot?.min !== "")
      return `${tot.min} - ${tot.max} yrs (Total)`;
    return "Not specified";
  };

  if (loading) {
    return (
      <EmployerLayout activeTab="dashboard" title="Loading Position...">
        <div className="py-24 flex flex-col items-center justify-center text-[var(--theme-text-muted)]">
          <Loader2 size={36} className="animate-spin text-[var(--theme-accent-silver)] mb-4" />
          <p className="text-sm font-semibold">Loading position dossier...</p>
        </div>
      </EmployerLayout>
    );
  }

  if (!job) {
    return (
      <EmployerLayout activeTab="dashboard" title="Job Not Found">
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] flex items-center justify-center mb-4 mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">Job Not Found</h2>
          <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mb-6">
            This job listing may have been deleted or moved.
          </p>
          <Link
            to="/employerdashboard"
            className="px-5 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs"
          >
            Return to Dashboard
          </Link>
        </div>
      </EmployerLayout>
    );
  }

  const modeStr = renderArray(job.mode || []);
  const isRemote = modeStr.toLowerCase().includes("home") || job.mode === "Online";
  const displayLocation = isRemote
    ? "Remote"
    : `${typeof job.location === "object" ? job.location?.address : job.location || "Location not specified"}`;

  const isGatedStatus = job.status === "pending_approval" || job.status === "rejected";

  return (
    <EmployerLayout
      activeTab="dashboard"
      title={job.title || "Job Overview"}
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Job Postings", path: "/employerdashboard" },
        { label: job.title || "Job Details" },
      ]}
    >
      {/* 1. TOP EXECUTIVE HEADER BANNER */}
      <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl p-6 sm:p-8 shadow-sm mb-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Status & Categorization Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  job.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : job.status === "pending_approval"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : job.status === "rejected"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]"
                }`}
              >
                {job.status === "pending_approval" ? "Under Review" : job.status}
              </span>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
                {modeStr}
              </span>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]">
                {renderArray(job.jobType)}
              </span>

              {job.department && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]">
                  {job.department}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text)] tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center text-xs text-[var(--theme-text-muted)] gap-4">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--theme-accent-silver)]" />
                <span className="truncate">{displayLocation}</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Clock size={14} className="text-[var(--theme-accent-silver)]" />
                <span>Posted {new Date(job.postedAt || job.createdAt).toLocaleDateString()}</span>
              </span>
              {job.applicationDeadline && (
                <span className="flex items-center gap-1.5 font-mono text-amber-400/90">
                  <Calendar size={14} />
                  <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to={`/job/${job._id}/applicants`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-sm"
            >
              <Users size={16} />
              <span>Review Applicants</span>
              {job.stats?.total > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--theme-bg)] text-[var(--theme-text)] text-[10px] font-mono">
                  {job.stats.total}
                </span>
              )}
            </Link>

            <Link
              to={`/editjob/${job._id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs sm:text-sm font-semibold hover:bg-[var(--theme-surface-hover)] transition-colors"
            >
              <Pencil size={15} />
              <span>Edit</span>
            </Link>

            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isGatedStatus || togglingStatus}
              className={`p-2.5 rounded-xl border transition-colors ${
                isGatedStatus
                  ? "text-[var(--theme-text-subtle)] bg-[var(--theme-surface-elevated)] border-[var(--theme-border)] cursor-not-allowed opacity-50"
                  : job.status === "active"
                  ? "text-red-400 hover:text-white hover:bg-red-600 border-red-500/20 bg-red-500/10"
                  : "text-emerald-400 hover:text-white hover:bg-emerald-600 border-emerald-500/20 bg-emerald-500/10"
              }`}
              title={job.status === "active" ? "Pause / Close Job" : "Reactivate Job"}
            >
              {togglingStatus ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Power size={16} />
              )}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:text-white hover:bg-red-600 transition-colors"
              title="Delete Position"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. BENTO CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Dossier */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] mb-3 flex items-center gap-2">
              <Briefcase size={16} className="text-[var(--theme-accent-silver)]" />
              <span>Executive Summary</span>
            </h2>
            <div className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed whitespace-pre-line">
              {job.jobSummary || job.description?.replace(/<[^>]+>/g, "") || "No executive summary provided."}
            </div>
          </div>

          {/* Key Deliverables & Responsibilities */}
          {job.keyResponsibilities && (
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] mb-3 flex items-center gap-2">
                <ListChecks size={16} className="text-[var(--theme-accent-silver)]" />
                <span>Deliverables & Responsibilities</span>
              </h2>
              <div className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed font-mono whitespace-pre-line space-y-1">
                {job.keyResponsibilities}
              </div>
            </div>
          )}

          {/* Core Technical & Domain Skills */}
          {(job.skillsRequired || []).length > 0 && (
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] mb-3 flex items-center gap-2">
                <Zap size={16} className="text-[var(--theme-accent-silver)]" />
                <span>Required Skill Stack</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-mono font-medium bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Screening Questions & Requested Documents */}
          {((job.screeningQuestions || []).length > 0 || (job.requestedDocuments || []).length > 0) && (
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] flex items-center gap-2">
                <HelpCircle size={16} className="text-[var(--theme-accent-silver)]" />
                <span>Screening & Application Criteria</span>
              </h2>

              {(job.screeningQuestions || []).length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-subtle)] mb-2">
                    Candidate Questions:
                  </p>
                  <ul className="space-y-2">
                    {job.screeningQuestions.map((q, idx) => (
                      <li
                        key={idx}
                        className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)]"
                      >
                        <span className="font-mono text-[var(--theme-accent-silver)] mr-2">Q{idx + 1}:</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(job.requestedDocuments || []).length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-subtle)] mb-2">
                    Required Uploads:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.requestedDocuments.map((doc, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] flex items-center gap-1.5"
                      >
                        <FileText size={12} className="text-[var(--theme-accent-silver)]" />
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Parameters & Criteria */}
        <div className="space-y-6">
          {/* Compensation Card */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] font-bold mb-3">
              Compensation Package
            </h3>
            <div className="text-2xl font-extrabold text-[var(--theme-text)] tracking-tight">
              {job.salaryMin === 0 && job.salaryMax === 0
                ? "Unpaid Internship"
                : `${job.salaryCurrency || "INR"} ${job.salaryMin} - ${job.salaryMax || job.salaryMin}`}
            </div>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1">
              Billed per {job.salaryFrequency || "Month"}
            </p>

            {(job.incentives || []).length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--theme-border)]">
                <span className="text-[11px] font-bold text-[var(--theme-text)] block mb-2">
                  Incentives & Perks
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.incentives.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Candidate Qualification Criteria */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] font-bold">
              Eligibility Matrix
            </h3>

            <div className="flex items-start gap-2.5 text-xs">
              <Target size={15} className="text-[var(--theme-accent-silver)] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[var(--theme-text)]">Experience</p>
                <p className="text-[var(--theme-text-muted)]">{renderExperience()}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <GraduationCap size={15} className="text-[var(--theme-accent-silver)] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[var(--theme-text)]">Education</p>
                <p className="text-[var(--theme-text-muted)]">
                  {renderArray(job.qualifications)}
                  {job.courses?.length > 0 && ` (${job.courses.join(", ")})`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <Languages size={15} className="text-[var(--theme-accent-silver)] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[var(--theme-text)]">Languages</p>
                <p className="text-[var(--theme-text-muted)]">{renderArray(job.languages)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <UserCircle2 size={15} className="text-[var(--theme-accent-silver)] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[var(--theme-text)]">Gender & Age</p>
                <p className="text-[var(--theme-text-muted)]">
                  {job.genderPreference || "No Preference"} •{" "}
                  {job.ageLimit?.isAny
                    ? "Any Age"
                    : `${job.ageLimit?.min || 18} - ${job.ageLimit?.max || 60} yrs`}
                </p>
              </div>
            </div>
          </div>

          {/* Shifts & Schedule */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] font-bold">
              Schedule & Headcount
            </h3>

            <div className="text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-[var(--theme-border)]/50">
                <span className="text-[var(--theme-text-muted)]">Openings</span>
                <span className="font-bold text-[var(--theme-text)]">{job.noOfPeopleRequired || 1}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--theme-border)]/50">
                <span className="text-[var(--theme-text-muted)]">Work Pattern</span>
                <span className="font-bold text-[var(--theme-text)]">{job.workDaysPattern || "Mon to Fri"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--theme-text-muted)]">Shift Timings</span>
                <span className="font-bold text-[var(--theme-text)]">
                  {job.isFlexibleShifts
                    ? "Flexible"
                    : `${job.shifts?.[0]?.startTime || "09:00"} - ${job.shifts?.[0]?.endTime || "18:00"}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployerLayout>
  );
}
