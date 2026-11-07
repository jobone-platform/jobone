import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  CalendarClock,
  Eye,
  Percent,
  Filter,
  ArrowUpRight,
  Award,
  Loader2,
  Layers,
  ChevronDown,
  Info,
  Calendar,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import EmployerLayout from "../components/employer/EmployerLayout";

export default function EmployerAnalytics() {
  const navigate = useNavigate();

  // Data states
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  // Filter states
  const [dateRange, setDateRange] = useState("all"); // "all", "30d", "90d"
  const [selectedJobId, setSelectedJobId] = useState("all");


  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) return navigate("/login");
        const { token } = JSON.parse(stored);
        const headers = { Authorization: `Bearer ${token}` };

        const [metricsRes, jobsRes, appsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/jobs/metrics`, { headers }).catch(() => ({ data: {} })),
          axios.get(`${API_BASE_URL}/jobs/employer-jobs`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/employer/my-candidates`, { headers }).catch(() => ({ data: [] })),
        ]);

        if (metricsRes.data) {
          setMetrics({
            totalJobs: metricsRes.data.totalJobs || 0,
            activeJobs: metricsRes.data.activeJobs || 0,
            totalApplications: metricsRes.data.totalApplications || 0,
            totalViews: metricsRes.data.totalViews || 0,
          });
        }

        const resolvedJobs = Array.isArray(jobsRes.data)
          ? jobsRes.data
          : jobsRes.data?.jobs || [];
        setJobs(resolvedJobs);

        setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
      } catch (err) {
        console.error("Failed to load recruitment analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  // Filtered applications based on date range and selected job
  const filteredApplications = useMemo(() => {
    const now = Date.now();
    const cutoffDays = dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : null;

    return applications.filter((app) => {
      // Date filter
      if (cutoffDays) {
        const appDate = new Date(app.appliedAt || app.createdAt || 0).getTime();
        const diffDays = (now - appDate) / (1000 * 60 * 60 * 24);
        if (diffDays > cutoffDays) return false;
      }

      // Job filter
      if (selectedJobId !== "all") {
        if (app.job_id?._id !== selectedJobId) return false;
      }

      return true;
    });
  }, [applications, dateRange, selectedJobId]);

  // Derived Analytics Metrics
  const telemetry = useMemo(() => {
    const total = filteredApplications.length;
    const shortlisted = filteredApplications.filter((a) => a.status === "shortlisted").length;
    const scheduled = filteredApplications.filter(
      (a) => a.status === "Interview Scheduled" || a.status === "Interview Conducted"
    ).length;
    const conducted = filteredApplications.filter((a) => a.status === "Interview Conducted").length;
    const assignment = filteredApplications.filter((a) => a.status === "Assignment Scheduled").length;
    const hired = filteredApplications.filter((a) => a.status === "hired").length;
    const nctt = filteredApplications.filter((a) => a.status === "NCTT").length;

    const conversionRate = total > 0 ? ((hired / total) * 100).toFixed(1) : "0.0";
    const shortlistRate = total > 0 ? ((shortlisted / total) * 100).toFixed(1) : "0.0";
    const interviewRate = total > 0 ? ((scheduled / total) * 100).toFixed(1) : "0.0";

    const totalActiveJobs =
      selectedJobId === "all"
        ? metrics.activeJobs || jobs.filter((j) => j.status === "active").length
        : jobs.find((j) => j._id === selectedJobId)?.status === "active"
        ? 1
        : 0;

    const avgApplicantsPerJob =
      jobs.length > 0 ? (total / Math.max(jobs.length, 1)).toFixed(1) : "0.0";

    // Per-job performance aggregation
    const jobStats = jobs.map((job) => {
      const jobApps = applications.filter((a) => a.job_id?._id === job._id);
      const jobHired = jobApps.filter((a) => a.status === "hired").length;
      const jobInterviews = jobApps.filter((a) => a.status.includes("Interview")).length;
      const conv = jobApps.length > 0 ? ((jobHired / jobApps.length) * 100).toFixed(1) : "0.0";

      return {
        id: job._id,
        title: job.title,
        status: job.status || "active",
        views: job.views || 0,
        applications: jobApps.length,
        interviews: jobInterviews,
        hired: jobHired,
        conversion: conv,
      };
    });

    return {
      total,
      shortlisted,
      scheduled,
      conducted,
      assignment,
      hired,
      nctt,
      conversionRate,
      shortlistRate,
      interviewRate,
      totalActiveJobs,
      avgApplicantsPerJob,
      jobStats,
    };
  }, [filteredApplications, jobs, metrics, applications, selectedJobId]);

  if (loading) {
    return (
      <EmployerLayout activeTab="analytics">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-silver mb-3" size={36} />
          <p className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
            Computing Recruitment Intelligence Telemetry...
          </p>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout activeTab="analytics">
      <div className="space-y-6 pb-20">
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
                Recruitment Intelligence
              </span>
              <span className="text-foreground/30 font-mono">/</span>
              <span className="text-xs font-mono text-silver uppercase">
                Funnel Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              Hiring Analytics & Funnel Conversion
            </h1>
            <p className="text-xs font-sans text-foreground/50 mt-1">
              Verifiable hiring metrics computed directly from active postings and candidate applications.
            </p>
          </div>

          {/* FILTERS: DATE RANGE & JOB */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Job Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl">
              <span className="text-[11px] font-mono text-foreground/40 pl-2">Job:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="bg-transparent text-xs font-mono text-foreground focus:outline-none cursor-pointer pr-2 max-w-[180px] truncate"
              >
                <option value="all">All Positions ({jobs.length})</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center p-1 rounded-xl bg-surface border border-border">
              {[
                { id: "all", label: "All Time" },
                { id: "90d", label: "90 Days" },
                { id: "30d", label: "30 Days" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDateRange(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    dateRange === d.id
                      ? "bg-elevated text-foreground font-bold shadow-sm border border-border"
                      : "text-foreground/50 hover:text-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1. EXECUTIVE KPI MATRIX */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: "Total Applicants",
              value: telemetry.total,
              sub: "Across selected scope",
              icon: Users,
            },
            {
              label: "Active Openings",
              value: telemetry.totalActiveJobs,
              sub: "Accepting submissions",
              icon: Briefcase,
            },
            {
              label: "Shortlisted",
              value: telemetry.shortlisted,
              sub: `${telemetry.shortlistRate}% qualification`,
              icon: CheckCircle2,
            },
            {
              label: "Interviews",
              value: telemetry.scheduled,
              sub: `${telemetry.conducted} conducted`,
              icon: CalendarClock,
            },
            {
              label: "Hired Talent",
              value: telemetry.hired,
              sub: "Confirmed offers",
              icon: Award,
            },
            {
              label: "Funnel Conversion",
              value: `${telemetry.conversionRate}%`,
              sub: "Applied to hired",
              icon: Percent,
            },
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-foreground/40 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider">
                    {kpi.label}
                  </span>
                  <Icon size={15} />
                </div>
                <div>
                  <span className="text-2xl font-display font-bold text-foreground">
                    {kpi.value}
                  </span>
                  <span className="block text-[11px] font-mono text-foreground/50 mt-0.5">
                    {kpi.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. RECRUITMENT FUNNEL & CONVERSION TELEMETRY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel Visualisation */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">
                  Recruitment Funnel Throughput
                </h3>
                <p className="text-xs font-sans text-foreground/50 mt-0.5">
                  Multi-stage drop-off rates and candidate qualification velocity.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-elevated border border-border text-xs font-mono text-silver">
                {telemetry.total} Candidates Processed
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {[
                {
                  stage: "1. Applications Received",
                  count: telemetry.total,
                  percentage: 100,
                  color: "bg-silver",
                  textColor: "text-silver",
                },
                {
                  stage: "2. Shortlisted for Evaluation",
                  count: telemetry.shortlisted,
                  percentage:
                    telemetry.total > 0
                      ? Math.round((telemetry.shortlisted / telemetry.total) * 100)
                      : 0,
                  color: "bg-blue-400",
                  textColor: "text-blue-400",
                },
                {
                  stage: "3. Interview Scheduled / Conducted",
                  count: telemetry.scheduled,
                  percentage:
                    telemetry.total > 0
                      ? Math.round((telemetry.scheduled / telemetry.total) * 100)
                      : 0,
                  color: "bg-purple-400",
                  textColor: "text-purple-400",
                },
                {
                  stage: "4. Practical Assignment",
                  count: telemetry.assignment,
                  percentage:
                    telemetry.total > 0
                      ? Math.round((telemetry.assignment / telemetry.total) * 100)
                      : 0,
                  color: "bg-amber-400",
                  textColor: "text-amber-400",
                },
                {
                  stage: "5. Hired / Accepted Offer",
                  count: telemetry.hired,
                  percentage:
                    telemetry.total > 0
                      ? Math.round((telemetry.hired / telemetry.total) * 100)
                      : 0,
                  color: "bg-emerald-400",
                  textColor: "text-emerald-400",
                },
              ].map((step, sIdx) => (
                <div key={sIdx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-foreground">{step.stage}</span>
                    <span className="text-foreground/60">
                      <strong className={step.textColor}>{step.count}</strong> candidates ({step.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-elevated rounded-full overflow-hidden border border-border">
                    <div
                      className={`h-full ${step.color} rounded-full transition-all duration-500`}
                      style={{ width: `${step.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Breakdown Segment */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground border-b border-border pb-3">
                Pipeline Distribution
              </h3>

              <div className="space-y-3 pt-3">
                {[
                  { label: "Applied (Awaiting Review)", count: telemetry.total - telemetry.shortlisted - telemetry.scheduled - telemetry.assignment - telemetry.hired - telemetry.nctt, color: "bg-foreground/40" },
                  { label: "Shortlisted", count: telemetry.shortlisted, color: "bg-blue-400" },
                  { label: "Interviewing", count: telemetry.scheduled, color: "bg-purple-400" },
                  { label: "Assignment", count: telemetry.assignment, color: "bg-amber-400" },
                  { label: "Hired", count: telemetry.hired, color: "bg-emerald-400" },
                  { label: "Not a Fit (NCTT)", count: telemetry.nctt, color: "bg-rose-400" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-foreground/70">{item.label}</span>
                    </div>
                    <span className="font-bold text-foreground">
                      {Math.max(0, item.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-elevated border border-border text-[11px] font-mono text-foreground/50 space-y-1">
              <span className="text-silver font-bold block uppercase">Data Provenance</span>
              <span>
                Computed from live MongoDB collections (`Application` and `Job`). Zero synthesized extrapolation.
              </span>
            </div>
          </div>
        </div>

        {/* 3. POSITION PERFORMANCE BENCHMARK MATRIX */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground">
                Requisition Performance Matrix
              </h3>
              <p className="text-xs font-sans text-foreground/50">
                Comparative applicant volumes, interview throughput, and offer conversion per open job.
              </p>
            </div>

            <span className="text-xs font-mono text-foreground/60">
              Total Openings: <strong className="text-foreground">{jobs.length}</strong>
            </span>
          </div>

          {telemetry.jobStats.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-foreground/40">
              No job postings created yet. Create a job listing to view performance telemetry.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-elevated/70 border-b border-border">
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Position Title
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Total Views
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Applicants
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Interviews
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Hired
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest text-right">
                      Conversion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {telemetry.jobStats.map((item) => (
                    <tr key={item.id} className="hover:bg-elevated/50 transition-colors">
                      <td className="p-4">
                        <Link
                          to={`/job/${item.id}/applicants`}
                          className="font-display font-bold text-sm text-foreground hover:text-silver transition-colors flex items-center gap-1.5"
                        >
                          {item.title}
                          <ArrowUpRight size={13} className="text-foreground/40" />
                        </Link>
                      </td>

                      <td className="p-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${
                            item.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
                              : "bg-surface text-foreground/60 border-border"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-foreground/70">{item.views}</td>
                      <td className="p-4 font-mono font-bold text-foreground">
                        {item.applications}
                      </td>
                      <td className="p-4 font-mono text-purple-400">{item.interviews}</td>
                      <td className="p-4 font-mono text-emerald-400 font-bold">{item.hired}</td>
                      <td className="p-4 font-mono text-right font-bold text-foreground">
                        {item.conversion}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </EmployerLayout>
  );
}
