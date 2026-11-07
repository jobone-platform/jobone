import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Briefcase,
  Building2,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminAnalyticsView({
  allJobs = [],
  allEmployers = [],
  allJobseekers = [],
  pendingJobs = [],
  pendingEmployers = [],
  unreadContacts = [],
  dbStats = {},
  onSelectTab,
}) {
  const [dateRange, setDateRange] = useState("30d"); // "today" | "7d" | "30d" | "90d" | "all" | "custom"
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [activeChartTab, setActiveChartTab] = useState("growth"); // "growth" | "jobs" | "verification" | "taxonomy"
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  // Compute date filter boundary timestamps
  const filterTimestamps = useMemo(() => {
    const now = new Date();
    let startTimestamp = 0;
    let prevStartTimestamp = 0;
    let prevEndTimestamp = 0;

    if (dateRange === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      startTimestamp = startOfDay;
      prevStartTimestamp = startOfDay - 24 * 60 * 60 * 1000;
      prevEndTimestamp = startOfDay;
    } else if (dateRange === "7d") {
      const ms = 7 * 24 * 60 * 60 * 1000;
      startTimestamp = now.getTime() - ms;
      prevStartTimestamp = startTimestamp - ms;
      prevEndTimestamp = startTimestamp;
    } else if (dateRange === "30d") {
      const ms = 30 * 24 * 60 * 60 * 1000;
      startTimestamp = now.getTime() - ms;
      prevStartTimestamp = startTimestamp - ms;
      prevEndTimestamp = startTimestamp;
    } else if (dateRange === "90d") {
      const ms = 90 * 24 * 60 * 60 * 1000;
      startTimestamp = now.getTime() - ms;
      prevStartTimestamp = startTimestamp - ms;
      prevEndTimestamp = startTimestamp;
    } else if (dateRange === "custom" && customStart) {
      startTimestamp = new Date(customStart).getTime();
      const endMs = customEnd ? new Date(customEnd).getTime() : now.getTime();
      const duration = endMs - startTimestamp;
      prevStartTimestamp = startTimestamp - duration;
      prevEndTimestamp = startTimestamp;
    }

    return { start: startTimestamp, prevStart: prevStartTimestamp, prevEnd: prevEndTimestamp };
  }, [dateRange, customStart, customEnd]);

  // Filter datasets by selected date range
  const { periodJobs, prevPeriodJobs } = useMemo(() => {
    const start = filterTimestamps.start;
    const prevStart = filterTimestamps.prevStart;
    const prevEnd = filterTimestamps.prevEnd;

    const current = start === 0
      ? allJobs
      : allJobs.filter((j) => new Date(j.createdAt || 0).getTime() >= start);

    const prev = prevStart === 0
      ? []
      : allJobs.filter((j) => {
          const t = new Date(j.createdAt || 0).getTime();
          return t >= prevStart && t < prevEnd;
        });

    return { periodJobs: current, prevPeriodJobs: prev };
  }, [allJobs, filterTimestamps]);

  const { periodEmployers, prevPeriodEmployers } = useMemo(() => {
    const start = filterTimestamps.start;
    const prevStart = filterTimestamps.prevStart;
    const prevEnd = filterTimestamps.prevEnd;

    const current = start === 0
      ? allEmployers
      : allEmployers.filter((e) => new Date(e.createdAt || 0).getTime() >= start);

    const prev = prevStart === 0
      ? []
      : allEmployers.filter((e) => {
          const t = new Date(e.createdAt || 0).getTime();
          return t >= prevStart && t < prevEnd;
        });

    return { periodEmployers: current, prevPeriodEmployers: prev };
  }, [allEmployers, filterTimestamps]);

  const { periodJobseekers, prevPeriodJobseekers } = useMemo(() => {
    const start = filterTimestamps.start;
    const prevStart = filterTimestamps.prevStart;
    const prevEnd = filterTimestamps.prevEnd;

    const current = start === 0
      ? allJobseekers
      : allJobseekers.filter((u) => new Date(u.createdAt || 0).getTime() >= start);

    const prev = prevStart === 0
      ? []
      : allJobseekers.filter((u) => {
          const t = new Date(u.createdAt || 0).getTime();
          return t >= prevStart && t < prevEnd;
        });

    return { periodJobseekers: current, prevPeriodJobseekers: prev };
  }, [allJobseekers, filterTimestamps]);

  // ─── PLATFORM KPIS ────────────────────────────────────────────────────────

  const totalUsers = (dbStats.jobseekers || allJobseekers.length) + (dbStats.employers || allEmployers.length);
  const periodUsersCount = periodJobseekers.length + periodEmployers.length;
  const prevPeriodUsersCount = prevPeriodJobseekers.length + prevPeriodEmployers.length;
  const userGrowthDelta = prevPeriodUsersCount > 0
    ? Math.round(((periodUsersCount - prevPeriodUsersCount) / prevPeriodUsersCount) * 100)
    : periodUsersCount > 0 ? 100 : 0;

  const totalActiveJobs = allJobs.filter((j) => j.status === "active").length;
  const periodActiveJobs = periodJobs.filter((j) => j.status === "active").length;
  const prevPeriodActiveJobs = prevPeriodJobs.filter((j) => j.status === "active").length;
  const jobGrowthDelta = prevPeriodActiveJobs > 0
    ? Math.round(((periodActiveJobs - prevPeriodActiveJobs) / prevPeriodActiveJobs) * 100)
    : periodActiveJobs > 0 ? 100 : 0;

  const totalApprovedEmployers = allEmployers.filter((e) => e.isApproved === "approved").length;
  const verificationRate = allEmployers.length > 0
    ? Math.round((totalApprovedEmployers / allEmployers.length) * 100)
    : 0;

  const totalApplications = useMemo(() => {
    return allJobs.reduce((acc, j) => acc + (j.applications?.length || 0), 0);
  }, [allJobs]);

  const avgApplicationsPerJob = allJobs.length > 0
    ? (totalApplications / allJobs.length).toFixed(1)
    : "0.0";

  // ─── CHART 1: USER & TALENT POOL VELOCITY (Last 7 intervals) ──────────────
  const registrationChartData = useMemo(() => {
    // Bucket by last 7 segments (days or weeks)
    const buckets = [
      { label: "Day -6", candidates: 0, employers: 0 },
      { label: "Day -5", candidates: 0, employers: 0 },
      { label: "Day -4", candidates: 0, employers: 0 },
      { label: "Day -3", candidates: 0, employers: 0 },
      { label: "Day -2", candidates: 0, employers: 0 },
      { label: "Yesterday", candidates: 0, employers: 0 },
      { label: "Today", candidates: 0, employers: 0 },
    ];

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    allJobseekers.forEach((u) => {
      const diffDays = Math.floor((now - new Date(u.createdAt || 0)) / dayMs);
      if (diffDays >= 0 && diffDays < 7) {
        buckets[6 - diffDays].candidates += 1;
      }
    });

    allEmployers.forEach((e) => {
      const diffDays = Math.floor((now - new Date(e.createdAt || 0)) / dayMs);
      if (diffDays >= 0 && diffDays < 7) {
        buckets[6 - diffDays].employers += 1;
      }
    });

    return buckets;
  }, [allJobseekers, allEmployers]);

  const maxRegValue = Math.max(
    ...registrationChartData.map((d) => Math.max(d.candidates, d.employers)),
    3
  );

  // ─── CHART 2: JOB MODERATION & PUBLISHING PIPELINE ───────────────────────
  const jobStatusBreakdown = useMemo(() => {
    const active = periodJobs.filter((j) => j.status === "active").length;
    const pending = periodJobs.filter((j) => j.status === "pending_approval" || j.status === "pending").length;
    const rejected = periodJobs.filter((j) => j.status === "rejected").length;
    const hidden = periodJobs.filter((j) => j.status === "hidden").length;
    const other = Math.max(0, periodJobs.length - (active + pending + rejected + hidden));

    return [
      { label: "Active Listings", count: active, percentage: periodJobs.length ? Math.round((active / periodJobs.length) * 100) : 0, color: "#FFFFFF" },
      { label: "Pending Moderation", count: pending, percentage: periodJobs.length ? Math.round((pending / periodJobs.length) * 100) : 0, color: "#C0C0C0" },
      { label: "Rejected Requisitions", count: rejected, percentage: periodJobs.length ? Math.round((rejected / periodJobs.length) * 100) : 0, color: "#737373" },
      { label: "Archived / Hidden", count: hidden + other, percentage: periodJobs.length ? Math.round(((hidden + other) / periodJobs.length) * 100) : 0, color: "#404040" },
    ];
  }, [periodJobs]);

  // ─── CHART 3: KYC COMPLIANCE FUNNEL ───────────────────────────────────────
  const kycFunnel = useMemo(() => {
    const total = periodEmployers.length || 1;
    const approved = periodEmployers.filter((e) => e.isApproved === "approved").length;
    const pending = periodEmployers.filter((e) => e.isApproved === "pending").length;
    const rejected = periodEmployers.filter((e) => e.isApproved === "rejected").length;
    const frozen = periodEmployers.filter((e) => e.isFrozen).length;

    return [
      { label: "Approved Corporate Entities", count: approved, pct: Math.round((approved / total) * 100) },
      { label: "Pending Compliance Review", count: pending, pct: Math.round((pending / total) * 100) },
      { label: "Rejected / Deficient Filings", count: rejected, pct: Math.round((rejected / total) * 100) },
      { label: "Frozen / Restricted Accounts", count: frozen, pct: Math.round((frozen / total) * 100) },
    ];
  }, [periodEmployers]);

  // ─── CHART 4: INDUSTRY SECTOR BREAKDOWN ──────────────────────────────────
  const industryDistribution = useMemo(() => {
    const sectors = {
      Technology: 0,
      Finance: 0,
      Healthcare: 0,
      Engineering: 0,
      Marketing: 0,
      Education: 0,
      Logistics: 0,
      Other: 0,
    };

    allJobs.forEach((job) => {
      const ind = (job.industry || "").toLowerCase();
      if (ind.includes("tech") || ind.includes("it") || ind.includes("software")) sectors.Technology += 1;
      else if (ind.includes("fin") || ind.includes("bank")) sectors.Finance += 1;
      else if (ind.includes("health") || ind.includes("medic")) sectors.Healthcare += 1;
      else if (ind.includes("eng") || ind.includes("manu")) sectors.Engineering += 1;
      else if (ind.includes("mark") || ind.includes("media")) sectors.Marketing += 1;
      else if (ind.includes("edu")) sectors.Education += 1;
      else if (ind.includes("logist") || ind.includes("supply")) sectors.Logistics += 1;
      else sectors.Other += 1;
    });

    const total = allJobs.length || 1;
    return Object.entries(sectors).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [allJobs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── Top Control Header & Smart Hybrid Date Filters ───────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--theme-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-accent-silver)]">
              <BarChart3 size={18} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
                Platform Intelligence & Analytics
              </h1>
              <p className="text-xs text-[var(--theme-text-muted)]">
                Verified telemetry derived strictly from live platform databases
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs font-mono">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "all", label: "All Time" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDateRange(p.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  dateRange === p.id
                    ? "bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-xs"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Period Badge */}
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[11px] font-mono font-bold text-[var(--theme-text)]">
            <Calendar size={13} className="text-[#C0C0C0]" />
            <span>Active Window: {dateRange.toUpperCase()}</span>
          </span>
        </div>
      </div>

      {/* ─── Platform Executive KPIs Strip ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Users & Growth */}
        <div className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)] font-bold">
              Total Platform Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-text)]">
              <Users size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--theme-text)]">
                {totalUsers.toLocaleString()}
              </span>
              <span
                className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                  userGrowthDelta >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {userGrowthDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {userGrowthDelta >= 0 ? `+${userGrowthDelta}%` : `${userGrowthDelta}%`}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[var(--theme-text-muted)] mt-1">
              {allJobseekers.length} candidates • {allEmployers.length} employers
            </p>
          </div>
        </div>

        {/* KPI 2: Active Requisitions */}
        <div className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)] font-bold">
              Active Job Listings
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-text)]">
              <Briefcase size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--theme-text)]">
                {totalActiveJobs.toLocaleString()}
              </span>
              <span
                className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                  jobGrowthDelta >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {jobGrowthDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {jobGrowthDelta >= 0 ? `+${jobGrowthDelta}%` : `${jobGrowthDelta}%`}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[var(--theme-text-muted)] mt-1">
              {allJobs.length} total • {pendingJobs.length} in moderation queue
            </p>
          </div>
        </div>

        {/* KPI 3: KYC Verification Ratio */}
        <div className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)] font-bold">
              KYC Verification Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-text)]">
              <ShieldCheck size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--theme-text)]">
                {verificationRate}%
              </span>
              <span className="text-xs font-mono text-[var(--theme-text-muted)]">
                ({totalApprovedEmployers}/{allEmployers.length})
              </span>
            </div>
            <p className="text-[11px] font-mono text-[var(--theme-text-muted)] mt-1">
              {pendingEmployers.length} compliance dossiers pending review
            </p>
          </div>
        </div>

        {/* KPI 4: Total Applications Pipeline */}
        <div className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)] font-bold">
              Applications Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-text)]">
              <FileText size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--theme-text)]">
                {totalApplications.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {avgApplicationsPerJob} / job
              </span>
            </div>
            <p className="text-[11px] font-mono text-[var(--theme-text-muted)] mt-1">
              Across all published position listings
            </p>
          </div>
        </div>
      </div>

      {/* ─── Chart Navigation Tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[var(--theme-border)] pb-2 overflow-x-auto">
        {[
          { id: "growth", label: "Registration & Talent Velocity", icon: Users },
          { id: "jobs", label: "Job Moderation Pipeline", icon: Briefcase },
          { id: "verification", label: "KYC Compliance Funnel", icon: ShieldCheck },
          { id: "taxonomy", label: "Sector & Market Taxonomy", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeChartTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveChartTab(tab.id)}
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

      {/* ─── ACTIVE CHART DISPLAY AREA ────────────────────────────────────── */}
      <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] p-6 shadow-xs min-h-[380px] flex flex-col justify-between">
        {/* CHART 1: REGISTRATION VELOCITY */}
        {activeChartTab === "growth" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--theme-border)]">
              <div>
                <h3 className="text-base font-bold font-display text-[var(--theme-text)]">
                  7-Day User Registration Velocity
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Chronological intake of candidate accounts vs corporate employers
                </p>
              </div>

              {/* Monochromatic Legend */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-[var(--theme-text)] border border-[var(--theme-border-silver)]" />
                  <span className="text-[var(--theme-text)] font-semibold">Candidates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-[#C0C0C0]" />
                  <span className="text-[var(--theme-text-muted)]">Employers</span>
                </div>
              </div>
            </div>

            {/* SVG Grouped Bar Chart */}
            <div className="relative pt-6 pb-2">
              <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-56 pt-6">
                {registrationChartData.map((d, idx) => {
                  const candHeight = Math.round((d.candidates / maxRegValue) * 100);
                  const empHeight = Math.round((d.employers / maxRegValue) * 100);
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-12 z-20 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] shadow-xl text-[10px] font-mono text-[var(--theme-text)] whitespace-nowrap animate-in fade-in duration-150">
                          {d.candidates} Candidates • {d.employers} Employers
                        </div>
                      )}

                      <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                        {/* Candidates bar */}
                        <div
                          style={{ height: `${Math.max(candHeight, 4)}%` }}
                          className="w-1/2 max-w-[20px] bg-[var(--theme-text)] rounded-t-sm transition-all duration-300 group-hover:brightness-125"
                        />
                        {/* Employers bar */}
                        <div
                          style={{ height: `${Math.max(empHeight, 4)}%` }}
                          className="w-1/2 max-w-[20px] bg-[#C0C0C0] rounded-t-sm transition-all duration-300 group-hover:brightness-125"
                        />
                      </div>

                      {/* X-axis label */}
                      <span className="text-[10px] font-mono text-[var(--theme-text-muted)] mt-2 text-center truncate w-full">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text-muted)] flex items-center justify-between">
              <span>Telemetry Sample: Real MongoDB timestamps from users collection</span>
              <span className="text-[var(--theme-text)] font-bold">100% Verified Telemetry</span>
            </div>
          </div>
        )}

        {/* CHART 2: JOB MODERATION BREAKDOWN */}
        {activeChartTab === "jobs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--theme-border)]">
              <div>
                <h3 className="text-base font-bold font-display text-[var(--theme-text)]">
                  Job Moderation & Lifecycle Breakdown
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Distribution of job requisitions across operational moderation statuses
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab("allJobs")}
                className="text-xs font-mono text-[var(--theme-text)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open Moderation Queue</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Status Bars */}
            <div className="space-y-4 pt-2">
              {jobStatusBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-[var(--theme-text)] flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-xs inline-block"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                    <span className="text-[var(--theme-text-muted)]">
                      {item.count} listings ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--theme-surface-elevated)] rounded-full overflow-hidden border border-[var(--theme-border)]">
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--theme-border)] text-xs font-mono">
              <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)]">
                <span className="text-[var(--theme-text-muted)] block">Moderation Speed</span>
                <span className="font-bold text-[var(--theme-text)] text-sm">Real-time Review</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)]">
                <span className="text-[var(--theme-text-muted)] block">Pending Action</span>
                <span className="font-bold text-amber-400 text-sm">{pendingJobs.length} Requisitions</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)]">
                <span className="text-[var(--theme-text-muted)] block">Approved Ratio</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {allJobs.length ? Math.round((totalActiveJobs / allJobs.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CHART 3: KYC COMPLIANCE FUNNEL */}
        {activeChartTab === "verification" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--theme-border)]">
              <div>
                <h3 className="text-base font-bold font-display text-[var(--theme-text)]">
                  KYC Business Compliance Funnel
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Employer credential verification status across corporate and individual recruiters
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab("allEmployers")}
                className="text-xs font-mono text-[var(--theme-text)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Verification Queue</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kycFunnel.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
                      Level {idx + 1}
                    </span>
                    <p className="text-xs font-bold text-[var(--theme-text)] mt-1">
                      {step.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-xl font-extrabold font-mono text-[var(--theme-text)]">
                      {step.count}
                    </span>
                    <span className="text-xs font-mono text-[var(--theme-text-muted)] ml-2">
                      ({step.pct}%)
                    </span>
                    <div className="w-full h-1.5 bg-[var(--theme-surface)] rounded-full mt-2 overflow-hidden">
                      <div
                        style={{ width: `${step.pct}%` }}
                        className="h-full bg-[var(--theme-text)] rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-[var(--theme-text)]">
                  Strict AWS S3 encrypted document verification pipeline active.
                </span>
              </div>
              <span className="text-[var(--theme-text-muted)]">
                {pendingEmployers.length} compliance reviews pending administrator action
              </span>
            </div>
          </div>
        )}

        {/* CHART 4: SECTOR TAXONOMY */}
        {activeChartTab === "taxonomy" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--theme-border)]">
              <div>
                <h3 className="text-base font-bold font-display text-[var(--theme-text)]">
                  Job Distribution by Industry Vertical
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Concentration of platform job listings across 8 key market taxonomies
                </p>
              </div>
              <span className="text-xs font-mono text-[var(--theme-text-muted)]">
                {allJobs.length} Total Postings Sampled
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {industryDistribution.map((sector, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-1.5"
                >
                  <span className="text-xs font-semibold text-[var(--theme-text)] truncate block">
                    {sector.name}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-extrabold font-mono text-[var(--theme-text)]">
                      {sector.count}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--theme-text-muted)]">
                      {sector.pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--theme-surface)] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${sector.pct}%` }}
                      className="h-full bg-[var(--theme-text)] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

