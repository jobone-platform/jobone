import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import EmployerLayout from "../components/employer/EmployerLayout";
import CompanyDisplay from "../components/CompanyDisplay";
import {
  PlusCircle,
  Briefcase,
  Users,
  Search,
  Power,
  Clock,
  ShieldAlert,
  XOctagon,
  RefreshCw,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileText,
  ChevronRight,
} from "lucide-react";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [employerName, setEmployerName] = useState("Employer");
  const [loading, setLoading] = useState(true);
  const [isTogglingId, setIsTogglingId] = useState(null);

  // View mode state (table vs card) persisted in localStorage
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem("employerViewMode") || "table";
    } catch {
      return "table";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("employerViewMode", viewMode);
    } catch (_err) {
      /* ignore */
    }
  }, [viewMode]);

  // Employer approval status ("approved" | "pending" | "rejected")
  const [approvalStatus, setApprovalStatus] = useState("pending");
  const [employerProfile, setEmployerProfile] = useState(null);

  // Overall metrics state
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
  });

  // Filters for job listings
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'closed' | 'pending'

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) {
          navigate("/login");
          return;
        }

        const employerInfo = JSON.parse(stored);
        const token = employerInfo?.token;
        const empId = employerInfo.id || employerInfo.employerId;
        const authConfig = { headers: { Authorization: `Bearer ${token}` } };

        // Execute profile, jobs, and metrics requests concurrently
        const [profileRes, jobsRes, metricsRes] = await Promise.all([
          empId
            ? axios
                .get(`${API_BASE_URL}/employer/profile/${empId}`, authConfig)
                .catch((profileErr) => {
                  console.error("Could not load employer profile name", profileErr);
                  return null;
                })
            : Promise.resolve(null),
          axios.get(`${API_BASE_URL}/jobs/employer-jobs`, authConfig).catch((err) => {
            console.error("Could not load jobs", err);
            return null;
          }),
          axios.get(`${API_BASE_URL}/jobs/metrics`, authConfig).catch((err) => {
            console.error("Could not load metrics", err);
            return null;
          }),
        ]);

        if (profileRes?.data) {
          setEmployerProfile(profileRes.data);
          setEmployerName(
            profileRes.data.companyName || profileRes.data.name || "Employer"
          );
          setApprovalStatus(profileRes.data.isApproved || "pending");
        }

        const jobsData = jobsRes?.data;
        const resolvedJobs = Array.isArray(jobsData) ? jobsData : jobsData?.jobs || [];
        setJobs(resolvedJobs);

        if (metricsRes?.data) {
          setMetrics(metricsRes.data);
        }
      } catch (err) {
        console.error("Employer API Error:", err);
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [navigate]);

  // Status toggle handler
  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      if (
        currentStatus === "pending_approval" ||
        currentStatus === "rejected"
      ) {
        alert(
          "Action Denied: You cannot manually activate a job that is pending admin approval or has been rejected."
        );
        return;
      }

      setIsTogglingId(jobId);
      const newStatus = currentStatus === "active" ? "closed" : "active";
      const stored = localStorage.getItem("employerInfo");
      const token = JSON.parse(stored)?.token;

      await axios.put(
        `${API_BASE_URL}/jobs/${jobId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
      );

      // Also update metrics locally
      setMetrics((prev) => ({
        ...prev,
        activeJobs:
          newStatus === "active"
            ? (prev.activeJobs || 0) + 1
            : Math.max(0, (prev.activeJobs || 0) - 1),
      }));
    } catch (error) {
      console.error("Failed to update job status:", error);
      alert("Failed to update job status. Please try again.");
    } finally {
      setIsTogglingId(null);
    }
  };

  const handleRepost = (job) => {
    navigate("/createjob", { state: { repostData: job } });
  };

  // Pipeline summary totals calculated across all employer jobs
  const pipelineStats = useMemo(() => {
    return jobs.reduce(
      (acc, j) => {
        const s = j.stats || {};
        acc.total += s.total || 0;
        acc.shortlisted += s.shortlisted || 0;
        acc.interviewScheduled += s.interviewScheduled || 0;
        acc.interviewConducted += s.interviewConducted || 0;
        acc.assignmentScheduled += s.assignmentScheduled || 0;
        acc.hired += s.hired || 0;
        acc.nctt += s.nctt || 0;
        return acc;
      },
      {
        total: 0,
        shortlisted: 0,
        interviewScheduled: 0,
        interviewConducted: 0,
        assignmentScheduled: 0,
        hired: 0,
        nctt: 0,
      }
    );
  }, [jobs]);

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchFilter.trim() ||
        job.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? job.status === "active"
          : statusFilter === "closed"
          ? job.status === "closed"
          : statusFilter === "pending"
          ? job.status === "pending_approval"
          : true;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchFilter, statusFilter]);

  const activeJobsCount = jobs.filter((j) => j.status === "active").length;
  const closedJobsCount = jobs.filter((j) => j.status === "closed").length;
  const pendingJobsCount = jobs.filter((j) => j.status === "pending_approval").length;

  return (
    <EmployerLayout
      activeTab="dashboard"
      title="Hiring Command Center"
      approvalStatus={approvalStatus}
      employerInfo={employerProfile}
    >
      {/* 1. TOP HEADER & GREETING */}
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[var(--theme-accent-silver)] bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] px-2 py-0.5 rounded">
              Hiring Portal
            </span>
            <span className="text-xs text-[var(--theme-text-subtle)] font-mono">• Live ATS</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--theme-text)] tracking-tight">
            Welcome back, {employerName}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--theme-text-muted)]">
            {approvalStatus === "approved"
              ? "Monitor your open roles, candidate pipeline velocity, and active applicant funnels."
              : "Review your account security status and verification progress."}
          </p>
        </div>

        {/* Quick Action Buttons */}
        {approvalStatus === "approved" ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/createjob"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-sm"
            >
              <PlusCircle size={17} />
              <span>Post New Job</span>
            </Link>
            <Link
              to="/candidates"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold text-xs sm:text-sm hover:bg-[var(--theme-surface-hover)] transition-colors"
            >
              <Search size={16} className="text-[var(--theme-accent-silver)]" />
              <span>Find Candidates</span>
            </Link>
            <Link
              to="/my-candidates"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold text-xs sm:text-sm hover:bg-[var(--theme-surface-hover)] transition-colors"
            >
              <Users size={16} className="text-[var(--theme-accent-silver)]" />
              <span>My Candidates</span>
            </Link>
          </div>
        ) : (
          <Link
            to="/employerdocupload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-amber-500/30 text-amber-400 font-bold text-xs sm:text-sm hover:bg-amber-500/10 transition-colors"
          >
            <FileText size={16} />
            <span>Upload Verification Docs</span>
          </Link>
        )}
      </div>

      {/* 2. LOADING STATE */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-[var(--theme-text-muted)]">
          <RefreshCw size={36} className="animate-spin text-[var(--theme-accent-silver)] mb-4" />
          <p className="text-sm font-semibold">Loading your hiring dashboard...</p>
        </div>
      ) : approvalStatus === "pending" ? (
        /* ======================================================== */
        /* PENDING APPROVAL LOCK SCREEN & GUIDANCE                  */
        /* ======================================================== */
        <div className="space-y-6">
          <div className="bg-[var(--theme-surface)] border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Clock size={38} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
              <ShieldAlert size={13} />
              Current Status: Under Verification
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text)] mb-3">
              Employer Account Pending Review
            </h2>

            <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed max-w-lg mx-auto mb-8">
              To maintain the highest standard of hiring opportunities for talent, our administration team manually verifies every new employer organization.
              Once approved, your account will have full access to publish listings, search verified resumes, and schedule candidate interviews.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto mb-8">
              <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
                <span className="text-[10px] font-mono text-[var(--theme-text-subtle)] font-bold">STEP 1</span>
                <p className="text-xs font-bold text-[var(--theme-text)] mt-1">Profile Created</p>
                <p className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Completed
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-amber-500/30">
                <span className="text-[10px] font-mono text-amber-400 font-bold">STEP 2</span>
                <p className="text-xs font-bold text-[var(--theme-text)] mt-1">Admin Verification</p>
                <p className="text-[11px] text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                  <Clock size={12} /> In Progress
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] opacity-60">
                <span className="text-[10px] font-mono text-[var(--theme-text-subtle)] font-bold">STEP 3</span>
                <p className="text-xs font-bold text-[var(--theme-text)] mt-1">Full ATS Access</p>
                <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">Pending Step 2</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/employerdocupload"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                <span>Upload KYC Documents</span>
              </Link>
              <Link
                to="/employerprofile"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold text-xs sm:text-sm hover:bg-[var(--theme-surface-hover)] transition-colors flex items-center justify-center gap-2"
              >
                <span>Edit Company Details</span>
              </Link>
            </div>
          </div>
        </div>
      ) : approvalStatus === "rejected" ? (
        /* ======================================================== */
        /* REJECTED STATUS SCREEN                                   */
        /* ======================================================== */
        <div className="bg-[var(--theme-surface)] border border-red-500/30 rounded-3xl p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-xl">
          <div className="w-20 h-20 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <XOctagon size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--theme-text)] mb-3">
            Registration Denied
          </h2>
          <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed max-w-lg mx-auto mb-6">
            Unfortunately, our administration team has declined your employer registration at this time. This can occur if submitted company documentation could not be verified.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity"
            >
              Contact Support
            </Link>
            <Link
              to="/employerdocupload"
              className="px-5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold text-xs sm:text-sm hover:bg-[var(--theme-surface-hover)] transition-colors"
            >
              Re-submit Documents
            </Link>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* APPROVED HIRING DASHBOARD                                */
        /* ======================================================== */
        <div className="space-y-6 sm:space-y-8">
          {/* 3. INTERACTIVE KPI METRICS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <MetricCard
              label="Total Jobs"
              value={metrics.totalJobs || jobs.length}
              subtext="All time postings"
              icon={Briefcase}
              color="silver"
              onClick={() => setStatusFilter("all")}
              isActive={statusFilter === "all"}
            />
            <MetricCard
              label="Active Listings"
              value={metrics.activeJobs ?? activeJobsCount}
              subtext="Accepting applicants"
              icon={CheckCircle2}
              color="emerald"
              onClick={() => setStatusFilter("active")}
              isActive={statusFilter === "active"}
            />
            <MetricCard
              label="Total Applicants"
              value={metrics.totalApplications || pipelineStats.total}
              subtext="Inbound candidates"
              icon={Users}
              color="blue"
              onClick={() => navigate("/my-candidates")}
            />
            <MetricCard
              label="Shortlisted"
              value={pipelineStats.shortlisted}
              subtext="Passed screening"
              icon={TrendingUp}
              color="purple"
              onClick={() => navigate("/my-candidates")}
            />
            <MetricCard
              label="Interviews"
              value={pipelineStats.interviewScheduled}
              subtext="Scheduled calls"
              icon={Calendar}
              color="amber"
              onClick={() => navigate("/my-candidates")}
            />
            <MetricCard
              label="Total Views"
              value={metrics.totalViews || 0}
              subtext="Listing impressions"
              icon={Eye}
              color="silver"
            />
          </div>

          {/* 4. HIRING PIPELINE VELOCITY SUMMARY STRIP */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--theme-text)]">
                  Active Candidate Pipeline Velocity
                </h3>
                <p className="text-[11px] text-[var(--theme-text-muted)]">
                  Live distribution across all active job openings
                </p>
              </div>
              <Link
                to="/my-candidates"
                className="text-xs font-semibold text-[var(--theme-accent-silver)] hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Full Candidate CRM</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              <PipelinePill
                stage="Inbound"
                count={pipelineStats.total}
                color="border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]"
              />
              <PipelinePill
                stage="Shortlisted"
                count={pipelineStats.shortlisted}
                color="border-blue-500/30 bg-blue-500/10 text-blue-400"
              />
              <PipelinePill
                stage="Int. Scheduled"
                count={pipelineStats.interviewScheduled}
                color="border-purple-500/30 bg-purple-500/10 text-purple-400"
              />
              <PipelinePill
                stage="Int. Conducted"
                count={pipelineStats.interviewConducted}
                color="border-amber-500/30 bg-amber-500/10 text-amber-400"
              />
              <PipelinePill
                stage="Assignment"
                count={pipelineStats.assignmentScheduled}
                color="border-orange-500/30 bg-orange-500/10 text-orange-400"
              />
              <PipelinePill
                stage="Hired"
                count={pipelineStats.hired}
                color="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              />
              <PipelinePill
                stage="NCTT / Arch"
                count={pipelineStats.nctt}
                color="border-red-500/30 bg-red-500/10 text-red-400"
              />
            </div>
          </div>

          {/* 5. JOB MANAGEMENT TRACKER */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl shadow-sm overflow-hidden">
            {/* Controls Bar */}
            <div className="p-4 sm:p-5 border-b border-[var(--theme-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--theme-surface-muted)]/30">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
                  Job Postings & Funnels
                </h2>

                {/* Status Filter Tabs */}
                <div className="flex items-center bg-[var(--theme-surface-elevated)] p-1 rounded-xl border border-[var(--theme-border)] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      statusFilter === "all"
                        ? "bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold shadow-sm"
                        : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                    }`}
                  >
                    All ({jobs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("active")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      statusFilter === "active"
                        ? "bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold shadow-sm"
                        : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                    }`}
                  >
                    Active ({activeJobsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("closed")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      statusFilter === "closed"
                        ? "bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold shadow-sm"
                        : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                    }`}
                  >
                    Closed ({closedJobsCount})
                  </button>
                  {pendingJobsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter("pending")}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        statusFilter === "pending"
                          ? "bg-amber-400 text-black font-bold shadow-sm"
                          : "text-amber-400 hover:text-amber-300"
                      }`}
                    >
                      Pending ({pendingJobsCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Search & View Mode Switcher */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-56">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]"
                  />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter by title..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] focus:outline-none focus:border-[var(--theme-border-silver)] transition-all"
                  />
                </div>

                <div className="flex bg-[var(--theme-surface-elevated)] p-1 rounded-xl border border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "table"
                        ? "bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-sm"
                        : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                    }`}
                    title="Table View"
                    aria-label="Table View"
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("card")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "card"
                        ? "bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-sm"
                        : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                    }`}
                    title="Card Grid View"
                    aria-label="Card Grid View"
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* List / Table / Empty Rendering */}
            {jobs.length === 0 ? (
              <div className="py-20 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] flex items-center justify-center mb-4">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-lg font-bold text-[var(--theme-text)] mb-1">
                  No Active Job Postings
                </h3>
                <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] max-w-sm mb-6">
                  Publish your first job vacancy to receive and manage inbound qualified candidate applications.
                </p>
                <Link
                  to="/createjob"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-sm"
                >
                  <PlusCircle size={16} />
                  <span>Create Your First Job</span>
                </Link>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <p className="text-sm font-semibold text-[var(--theme-text)]">
                  No job postings match your filters.
                </p>
                <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                  Try adjusting your search query or status filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchFilter("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === "card" ? (
              /* CARD VIEW */
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {filteredJobs.map((job) => (
                  <JobCardItem
                    key={job._id}
                    job={job}
                    toggleJobStatus={toggleJobStatus}
                    isToggling={isTogglingId === job._id}
                    navigate={navigate}
                    employerName={employerName}
                    handleRepost={handleRepost}
                  />
                ))}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-[var(--theme-surface-elevated)]/60 border-b border-[var(--theme-border)] text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
                      <th className="py-3.5 px-4 font-bold">Job Title & Details</th>
                      <th className="py-3.5 px-3 font-bold text-center">Status</th>
                      <th className="py-3.5 px-3 font-bold text-center border-l border-[var(--theme-border)]/50">
                        Total
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-blue-400 bg-blue-500/5">
                        Shortlisted
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-purple-400 bg-purple-500/5">
                        Int. Sched
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-amber-400 bg-amber-500/5">
                        Int. Cond
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-orange-400 bg-orange-500/5">
                        Assignment
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-emerald-400 bg-emerald-500/5">
                        Hired
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-red-400 bg-red-500/5">
                        NCTT
                      </th>
                      <th className="py-3.5 px-4 font-bold text-right border-l border-[var(--theme-border)]/50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--theme-border)] text-xs">
                    {filteredJobs.map((job) => (
                      <JobTableRow
                        key={job._id}
                        job={job}
                        toggleJobStatus={toggleJobStatus}
                        isToggling={isTogglingId === job._id}
                        navigate={navigate}
                        employerName={employerName}
                        handleRepost={handleRepost}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </EmployerLayout>
  );
}

/* ==========================================================================
   SUBCOMPONENTS
   ========================================================================== */

function MetricCard({
  label,
  value,
  subtext,
  icon,
  color = "silver",
  onClick,
  isActive = false,
}) {
  const Icon = icon;
  const colorMap = {
    silver: "text-[var(--theme-accent-silver)] bg-[var(--theme-surface-hover)] border-[var(--theme-border)]",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-4 sm:p-5 transition-all bg-[var(--theme-surface)] shadow-sm ${
        onClick ? "cursor-pointer hover:border-[var(--theme-border-silver)] hover:shadow-md" : ""
      } ${
        isActive
          ? "ring-2 ring-[var(--theme-accent-silver)] border-[var(--theme-border-silver)]"
          : "border-[var(--theme-border)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold text-[var(--theme-text-muted)] truncate">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-xl sm:text-2xl font-extrabold text-[var(--theme-text)] tracking-tight">
        {value}
      </div>
      {subtext && (
        <p className="text-[10px] text-[var(--theme-text-subtle)] mt-1 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}

function PipelinePill({ stage, count, color }) {
  return (
    <div className={`p-2.5 rounded-xl border text-center transition-colors ${color}`}>
      <span className="block text-[9px] font-mono font-bold uppercase opacity-80 truncate">
        {stage}
      </span>
      <span className="block text-sm sm:text-base font-extrabold mt-0.5">
        {count}
      </span>
    </div>
  );
}

function JobTableRow({
  job,
  toggleJobStatus,
  isToggling,
  navigate,
  employerName,
  handleRepost,
}) {
  const s = job.stats || {};
  const isGatedStatus =
    job.status === "pending_approval" || job.status === "rejected";

  return (
    <tr
      onClick={() => navigate(`/job/${job._id}`)}
      className="hover:bg-[var(--theme-surface-hover)]/70 transition-colors cursor-pointer group"
    >
      {/* Job Title & Details */}
      <td className="py-3.5 px-4 max-w-xs">
        <div className="font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors truncate">
          {job.title}
        </div>
        <div className="text-[11px] text-[var(--theme-text-muted)] font-medium mt-0.5 flex items-center gap-2">
          <CompanyDisplay job={job} fallback={employerName} />
          {job.location && (
            <>
              <span className="text-[var(--theme-text-subtle)]">•</span>
              <span className="truncate">{job.location}</span>
            </>
          )}
        </div>
        <div className="text-[10px] text-[var(--theme-text-subtle)] mt-0.5 flex items-center gap-1.5 font-mono">
          <Clock size={11} />
          <span>Posted {new Date(job.postedAt || job.createdAt).toLocaleDateString()}</span>
        </div>
      </td>

      {/* Status Badge */}
      <td className="py-3.5 px-3 text-center">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
            job.status === "active"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : job.status === "pending_approval"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : job.status === "rejected"
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]"
          }`}
        >
          {job.status === "pending_approval" ? "Review" : job.status}
        </span>
      </td>

      {/* Applicant Funnel Cells */}
      <td className="py-3.5 px-3 text-center font-bold text-[var(--theme-text)] border-l border-[var(--theme-border)]/50">
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/job/${job._id}/applicants`);
          }}
          className="hover:underline hover:text-[var(--theme-accent-silver)] transition-colors block cursor-pointer"
          title="View All Applicants"
        >
          {s.total || 0}
        </span>
      </td>

      <td className="py-3.5 px-3 text-center font-bold text-blue-400 bg-blue-500/5">
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/job/${job._id}/applicants?status=shortlisted`);
          }}
          className="hover:underline transition-colors block cursor-pointer"
          title="View Shortlisted"
        >
          {s.shortlisted || 0}
        </span>
      </td>

      <td className="py-3.5 px-3 text-center font-bold text-purple-400 bg-purple-500/5">
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/job/${job._id}/applicants?status=Interview Scheduled`);
          }}
          className="hover:underline transition-colors block cursor-pointer"
          title="View Interview Scheduled"
        >
          {s.interviewScheduled || 0}
        </span>
      </td>

      <td className="py-3.5 px-3 text-center font-bold text-amber-400 bg-amber-500/5">
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/job/${job._id}/applicants?status=Interview Conducted`);
          }}
          className="hover:underline transition-colors block cursor-pointer"
          title="View Interview Conducted"
        >
          {s.interviewConducted || 0}
        </span>
      </td>

      <td className="py-3.5 px-3 text-center font-bold text-orange-400 bg-orange-500/5">
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/job/${job._id}/applicants?status=Assignment Scheduled`);
          }}
          className="hover:underline transition-colors block cursor-pointer"
          title="View Assignment Scheduled"
        >
          {s.assignmentScheduled || 0}
        </span>
      </td>

      <td className="py-3.5 px-3 text-center font-bold text-emerald-400 bg-emerald-500/5">
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/job/${job._id}/applicants?status=hired`);
          }}
          className="hover:underline transition-colors block cursor-pointer"
          title="View Hired"
        >
          {s.hired || 0}
        </span>
      </td>

      <td className="py-3.5 px-3 text-center font-bold text-red-400 bg-red-500/5">
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/job/${job._id}/applicants?status=NCTT`);
          }}
          className="hover:underline transition-colors block cursor-pointer"
          title="View NCTT"
        >
          {s.nctt || 0}
        </span>
      </td>

      {/* Action Buttons */}
      <td className="py-3.5 px-4 text-right border-l border-[var(--theme-border)]/50">
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate(`/job/${job._id}`)}
            className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors"
            title="View Details"
          >
            <Eye size={15} />
          </button>

          {job.status === "closed" && (
            <button
              type="button"
              onClick={() => handleRepost(job)}
              className="p-1.5 rounded-lg text-[var(--theme-accent-silver)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors"
              title="Repost / Clone Job"
            >
              <PlusCircle size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => toggleJobStatus(job._id, job.status)}
            disabled={isGatedStatus || isToggling}
            className={`p-1.5 rounded-lg transition-colors border ${
              isGatedStatus
                ? "text-[var(--theme-text-subtle)] bg-[var(--theme-surface-elevated)] border-[var(--theme-border)] cursor-not-allowed opacity-50"
                : job.status === "active"
                ? "text-red-400 hover:text-white hover:bg-red-600 border-red-500/20 bg-red-500/10"
                : "text-emerald-400 hover:text-white hover:bg-emerald-600 border-emerald-500/20 bg-emerald-500/10"
            }`}
            title={
              isGatedStatus
                ? "Locked: Pending admin approval"
                : job.status === "active"
                ? "Close Listing"
                : "Reactivate Listing"
            }
          >
            {isToggling ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Power size={15} />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

function JobCardItem({
  job,
  toggleJobStatus,
  isToggling,
  navigate,
  employerName,
  handleRepost,
}) {
  const s = job.stats || {};
  const isGatedStatus =
    job.status === "pending_approval" || job.status === "rejected";

  return (
    <div
      onClick={() => navigate(`/job/${job._id}`)}
      className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-[var(--theme-border-silver)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm sm:text-base text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors line-clamp-2">
              {job.title}
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1 flex items-center gap-1.5 font-medium">
              <CompanyDisplay job={job} fallback={employerName} />
              {job.location && (
                <>
                  <span className="text-[var(--theme-text-subtle)]">•</span>
                  <span className="truncate">{job.location}</span>
                </>
              )}
            </p>
          </div>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
              job.status === "active"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : job.status === "pending_approval"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : job.status === "rejected"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]"
            }`}
          >
            {job.status === "pending_approval" ? "Review" : job.status}
          </span>
        </div>

        <div className="text-[10px] text-[var(--theme-text-subtle)] mb-4 flex items-center gap-1.5 font-mono">
          <Clock size={11} />
          <span>Posted {new Date(job.postedAt || job.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Funnel Metrics Grid */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          <CardMetricBox
            title="Total"
            value={s.total || 0}
            color="border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/job/${job._id}/applicants`);
            }}
          />
          <CardMetricBox
            title="Short"
            value={s.shortlisted || 0}
            color="border-blue-500/20 bg-blue-500/10 text-blue-400"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/job/${job._id}/applicants?status=shortlisted`);
            }}
          />
          <CardMetricBox
            title="Int. S"
            value={s.interviewScheduled || 0}
            color="border-purple-500/20 bg-purple-500/10 text-purple-400"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/job/${job._id}/applicants?status=Interview Scheduled`);
            }}
          />
          <CardMetricBox
            title="Hired"
            value={s.hired || 0}
            color="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/job/${job._id}/applicants?status=hired`);
            }}
          />
        </div>
      </div>

      {/* Card Footer Actions */}
      <div
        className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => navigate(`/job/${job._id}/applicants`)}
          className="text-xs font-semibold text-[var(--theme-accent-silver)] hover:underline flex items-center gap-1"
        >
          <span>View Applicants</span>
          <ArrowRight size={13} />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/job/${job._id}`)}
            className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors"
            title="View Details"
          >
            <Eye size={14} />
          </button>

          {job.status === "closed" && (
            <button
              type="button"
              onClick={() => handleRepost(job)}
              className="p-1.5 rounded-lg text-[var(--theme-accent-silver)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors"
              title="Repost / Clone Job"
            >
              <PlusCircle size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => toggleJobStatus(job._id, job.status)}
            disabled={isGatedStatus || isToggling}
            className={`p-1.5 rounded-lg transition-colors border ${
              isGatedStatus
                ? "text-[var(--theme-text-subtle)] bg-[var(--theme-surface-elevated)] border-[var(--theme-border)] cursor-not-allowed opacity-50"
                : job.status === "active"
                ? "text-red-400 hover:text-white hover:bg-red-600 border-red-500/20 bg-red-500/10"
                : "text-emerald-400 hover:text-white hover:bg-emerald-600 border-emerald-500/20 bg-emerald-500/10"
            }`}
            title={
              isGatedStatus
                ? "Locked: Pending admin approval"
                : job.status === "active"
                ? "Close Listing"
                : "Reactivate Listing"
            }
          >
            {isToggling ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Power size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CardMetricBox({ title, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-xl border text-center transition-all cursor-pointer hover:opacity-90 ${color}`}
      title={`Click to filter ${title}`}
    >
      <span className="block text-[8px] font-mono font-bold uppercase truncate">
        {title}
      </span>
      <span className="block text-xs sm:text-sm font-extrabold mt-0.5">
        {value}
      </span>
    </div>
  );
}
