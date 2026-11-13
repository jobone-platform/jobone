import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  UserCheck,
  Mail,
  Phone,
  ChevronRight,
  Briefcase,
  Search,
  Filter,
  Calendar,
  CalendarClock,
  BarChart3,
  Users,
  LayoutGrid,
  LayoutList,
  CheckCircle2,
  Clock,
  Video,
  X,
  Eye,
  CheckSquare,
  MessageSquareQuote,
  ExternalLink,
  Plus,
  ShieldCheck,
  TrendingUp,
  Percent,
  Sparkles,
  Award,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config/api";
import EmployerLayout from "../components/employer/EmployerLayout";

const STATUS_CONFIG = {
  applied: {
    label: "Applied",
    badgeClass: "bg-surface text-foreground/80 border-border",
    color: "slate",
  },
  shortlisted: {
    label: "Shortlisted",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    color: "blue",
  },
  "Interview Scheduled": {
    label: "Interview Scheduled",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    color: "purple",
  },
  "Interview Conducted": {
    label: "Interview Conducted",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    color: "cyan",
  },
  "Assignment Scheduled": {
    label: "Assignment",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    color: "amber",
  },
  hired: {
    label: "Hired",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold",
    color: "emerald",
  },
  NCTT: {
    label: "Not a Fit (NCTT)",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    color: "rose",
  },
};

export default function MyCandidates() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active top-level tab
  const activeTabParam = searchParams.get("tab") || "roster";
  const [currentTab, setCurrentTab] = useState(activeTabParam);

  // Data state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJobFilter, setSelectedJobFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // "cards" vs "table"

  // Interview view states
  const [interviewFilter, setInterviewFilter] = useState("all"); // "all", "upcoming", "conducted", "reschedule"

  // Candidate Quick-View Drawer
  const [drawerApp, setDrawerApp] = useState(null);

  // Status Action Modal
  const [actionModal, setActionModal] = useState({
    show: false,
    status: "",
    title: "",
    requireMessage: false,
    appId: null,
    requestData: null,
  });
  const [employerMessage, setEmployerMessage] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Team Collaboration State (Local storage persisted)
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const stored = localStorage.getItem("jobone_employer_team");
      if (stored) return JSON.parse(stored);
    } catch (_err) {
      /* ignore */
    }
    return [
      {
        id: "owner-1",
        name: "Primary Account Owner",
        email: "admin@company.com",
        role: "Admin",
        status: "Active",
        addedAt: "2026-01-15",
      },
    ];
  });
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newInvite, setNewInvite] = useState({ name: "", email: "", role: "Recruiter" });

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab") || "roster";
    setCurrentTab(tab);
  }, [searchParams]);

  const switchTab = (tabName) => {
    setCurrentTab(tabName);
    if (tabName === "roster") {
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", tabName);
    }
    setSearchParams(searchParams);
  };

  // Fetch candidates across all jobs
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) return navigate("/login");
        const { token, employer } = JSON.parse(stored);

        // Update default owner email in team state if available
        if (employer?.email) {
          setTeamMembers((prev) =>
            prev.map((m) =>
              m.id === "owner-1"
                ? {
                    ...m,
                    name: employer.name || employer.companyName || "Primary Account Owner",
                    email: employer.email,
                  }
                : m
            )
          );
        }

        const { data } = await axios.get(`${API_BASE_URL}/employer/my-candidates`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load candidates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [navigate]);

  // Extract unique job titles for filter dropdown
  const uniqueJobs = useMemo(() => {
    const map = new Map();
    applications.forEach((app) => {
      if (app.job_id?._id && app.job_id?.title) {
        map.set(app.job_id._id, app.job_id.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const candidateName = app.appliedBy?.name?.toLowerCase() || "";
      const candidateEmail = app.appliedBy?.email?.toLowerCase() || "";
      const jobTitle = app.job_id?.title?.toLowerCase() || "";

      const matchesSearch =
        candidateName.includes(searchQuery.toLowerCase()) ||
        candidateEmail.includes(searchQuery.toLowerCase()) ||
        jobTitle.includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesJob =
        selectedJobFilter === "all" || app.job_id?._id === selectedJobFilter;

      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [applications, searchQuery, statusFilter, selectedJobFilter]);

  // Scheduled interviews subset
  const scheduledInterviews = useMemo(() => {
    return applications.filter(
      (app) =>
        app.status === "Interview Scheduled" ||
        app.status === "Interview Conducted" ||
        app.rescheduleRequest?.isRequested
    );
  }, [applications]);

  // Reschedule pending subset
  const pendingReschedules = useMemo(() => {
    return applications.filter(
      (app) => app.rescheduleRequest?.requestStatus === "pending"
    );
  }, [applications]);

  // Metrics for Analytics Tab
  const analyticsMetrics = useMemo(() => {
    const total = applications.length;
    const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
    const scheduled = applications.filter(
      (a) => a.status === "Interview Scheduled" || a.status === "Interview Conducted"
    ).length;
    const conducted = applications.filter((a) => a.status === "Interview Conducted").length;
    const assignment = applications.filter((a) => a.status === "Assignment Scheduled").length;
    const hired = applications.filter((a) => a.status === "hired").length;
    const nctt = applications.filter((a) => a.status === "NCTT").length;

    const conversionRate = total > 0 ? ((hired / total) * 100).toFixed(1) : "0.0";
    const shortlistRate = total > 0 ? ((shortlisted / total) * 100).toFixed(1) : "0.0";
    const interviewRate = total > 0 ? ((scheduled / total) * 100).toFixed(1) : "0.0";

    // Application count per job
    const jobBreakdown = {};
    applications.forEach((app) => {
      const title = app.job_id?.title || "Unknown Position";
      if (!jobBreakdown[title]) {
        jobBreakdown[title] = { count: 0, hired: 0, interviews: 0 };
      }
      jobBreakdown[title].count += 1;
      if (app.status === "hired") jobBreakdown[title].hired += 1;
      if (app.status.includes("Interview")) jobBreakdown[title].interviews += 1;
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
      jobBreakdown: Object.entries(jobBreakdown).map(([title, stats]) => ({
        title,
        ...stats,
      })),
    };
  }, [applications]);

  // Update Status handler
  const handleStatusUpdate = async () => {
    if (!actionModal.appId) return;
    setActionLoading(true);

    try {
      const stored = localStorage.getItem("employerInfo");
      const { token } = JSON.parse(stored);

      await axios.patch(
        `${API_BASE_URL}/applications/${actionModal.appId}/status`,
        {
          status: actionModal.status,
          employerMessage,
          meetingLink,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplications((prev) =>
        prev.map((app) =>
          app._id === actionModal.appId
            ? {
                ...app,
                status: actionModal.status,
                employerMessage,
                meetingLink,
              }
            : app
        )
      );

      if (drawerApp?._id === actionModal.appId) {
        setDrawerApp((prev) => ({
          ...prev,
          status: actionModal.status,
          employerMessage,
          meetingLink,
        }));
      }

      setActionModal({
        show: false,
        status: "",
        title: "",
        requireMessage: false,
        appId: null,
        requestData: null,
      });
      setEmployerMessage("");
      setMeetingLink("");
    } catch (err) {
      console.error("Status update error", err);
      alert("Failed to update candidate status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reschedule response handler
  const handleRescheduleResponse = async (action) => {
    if (!actionModal.appId) return;
    setActionLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("employerInfo")).token;
      await axios.patch(
        `${API_BASE_URL}/applications/${actionModal.appId}/reschedule/respond`,
        { action, employerMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplications((prev) =>
        prev.map((app) =>
          app._id === actionModal.appId
            ? {
                ...app,
                rescheduleRequest: {
                  ...app.rescheduleRequest,
                  requestStatus: action,
                },
                employerMessage,
              }
            : app
        )
      );

      if (drawerApp?._id === actionModal.appId) {
        setDrawerApp((prev) => ({
          ...prev,
          rescheduleRequest: {
            ...prev.rescheduleRequest,
            requestStatus: action,
          },
          employerMessage,
        }));
      }

      setActionModal({
        show: false,
        status: "",
        title: "",
        requireMessage: false,
        appId: null,
        requestData: null,
      });
      setEmployerMessage("");
    } catch (err) {
      console.error("Reschedule response error", err);
      alert("Failed to process reschedule response.");
    } finally {
      setActionLoading(false);
    }
  };

  // Add team member handler
  const handleAddTeamMember = (e) => {
    e.preventDefault();
    if (!newInvite.email.trim() || !newInvite.name.trim()) return;

    const newMember = {
      id: `member-${Date.now()}`,
      name: newInvite.name.trim(),
      email: newInvite.email.trim(),
      role: newInvite.role,
      status: "Invited",
      addedAt: new Date().toISOString().split("T")[0],
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    try {
      localStorage.setItem("jobone_employer_team", JSON.stringify(updated));
    } catch (_err) {
      /* ignore */
    }

    setNewInvite({ name: "", email: "", role: "Recruiter" });
    setInviteModalOpen(false);
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || {
      label: status || "Applied",
      badgeClass: "bg-surface text-foreground/70 border-border",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase border ${config.badgeClass}`}
      >
        {config.label}
      </span>
    );
  };

  const candidateIdList = useMemo(() => {
    return filteredApplications
      .map((a) => a.appliedBy?._id)
      .filter(Boolean);
  }, [filteredApplications]);

  if (loading) {
    return (
      <EmployerLayout
      activeTab="my-candidates"
      title="Candidate Pipeline"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Candidate Pipeline" },
      ]}
    >
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-silver mb-3" size={36} />
          <p className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
            Loading Recruitment Workspace...
          </p>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout
      activeTab="my-candidates"
      title="Candidate Pipeline"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Candidate Pipeline" },
      ]}
    >
      <div className="space-y-6 pb-20">
        {/* HEADER & PORTAL HUB NAVIGATION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
                Employer Workspace
              </span>
              <span className="text-foreground/30 font-mono">/</span>
              <span className="text-xs font-mono text-silver uppercase">
                Candidate CRM & Interviews
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              Candidate Directory & Hiring Intelligence
            </h1>
            <p className="text-xs font-sans text-foreground/50 mt-1">
              Unified recruitment pipeline across all jobs, active interview schedules, and funnel telemetry.
            </p>
          </div>

          {/* MAIN TAB SWITCHER */}
          <div className="flex items-center p-1 rounded-2xl bg-surface border border-border overflow-x-auto">
            <button
              onClick={() => switchTab("roster")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                currentTab === "roster"
                  ? "bg-elevated text-foreground shadow-sm font-bold border border-border"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Users size={14} /> Candidates ({applications.length})
            </button>
            <button
              onClick={() => switchTab("interviews")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                currentTab === "interviews"
                  ? "bg-elevated text-foreground shadow-sm font-bold border border-border"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <CalendarClock size={14} /> Interviews ({scheduledInterviews.length})
            </button>
            <button
              onClick={() => switchTab("analytics")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                currentTab === "analytics"
                  ? "bg-elevated text-foreground shadow-sm font-bold border border-border"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <BarChart3 size={14} /> Funnel & Analytics
            </button>
            <button
              onClick={() => switchTab("team")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                currentTab === "team"
                  ? "bg-elevated text-foreground shadow-sm font-bold border border-border"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <ShieldCheck size={14} /> Team ({teamMembers.length})
            </button>
          </div>
        </div>

        {/* PENDING RESCHEDULE NOTIFICATION BANNER */}
        {pendingReschedules.length > 0 && currentTab !== "interviews" && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="text-amber-400 shrink-0" size={18} />
              <div>
                <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
                  {pendingReschedules.length} Reschedule Request{pendingReschedules.length > 1 ? "s" : ""} Awaiting Response
                </p>
                <p className="text-xs font-sans text-amber-200/80 mt-0.5">
                  Candidates have requested alternate interview slots.
                </p>
              </div>
            </div>
            <button
              onClick={() => switchTab("interviews")}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-mono uppercase tracking-wider shrink-0 transition-colors"
            >
              Review in Interview Hub
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: CANDIDATE ROSTER / CRM                                             */}
        {/* ========================================================================= */}
        {currentTab === "roster" && (
          <div className="space-y-6">
            {/* SEARCH & FILTERS BAR */}
            <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search text */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by candidate name, email, or applied position..."
                  className="w-full pl-10 pr-4 py-2 bg-elevated border border-border rounded-xl text-xs font-sans text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Job and Status Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Job filter */}
                <select
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  className="bg-elevated border border-border text-foreground text-xs font-mono px-3 py-2 rounded-xl focus:outline-none focus:border-silver cursor-pointer max-w-[200px] truncate"
                >
                  <option value="all">All Jobs ({uniqueJobs.length})</option>
                  {uniqueJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-elevated border border-border text-foreground text-xs font-mono px-3 py-2 rounded-xl focus:outline-none focus:border-silver cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Interview Conducted">Interview Conducted</option>
                  <option value="Assignment Scheduled">Assignment</option>
                  <option value="hired">Hired</option>
                  <option value="NCTT">Not a Fit (NCTT)</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-elevated border border-border">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === "cards"
                        ? "bg-surface text-foreground shadow-sm"
                        : "text-foreground/50 hover:text-foreground"
                    }`}
                    title="Grid Cards View"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === "table"
                        ? "bg-surface text-foreground shadow-sm"
                        : "text-foreground/50 hover:text-foreground"
                    }`}
                    title="Dense Table View"
                  >
                    <LayoutList size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* CANDIDATES LIST: EMPTY STATE */}
            {filteredApplications.length === 0 ? (
              <div className="p-16 rounded-3xl bg-surface border border-border text-center">
                <div className="w-16 h-16 rounded-2xl bg-elevated border border-border flex items-center justify-center mx-auto mb-4 text-foreground/40">
                  <UserCheck size={28} />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">
                  No candidates match your criteria
                </h3>
                <p className="text-xs font-sans text-foreground/50 max-w-sm mx-auto mt-1 mb-6">
                  Try clearing your search query or switching your job filter to display all historical applicants.
                </p>
                {(searchQuery || statusFilter !== "all" || selectedJobFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setSelectedJobFilter("all");
                    }}
                    className="px-4 py-2 rounded-xl bg-elevated border border-border text-xs font-mono text-foreground hover:bg-surface transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : viewMode === "cards" ? (
              /* GRID CARDS VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApplications.map((app) => {
                  const candidate = app.appliedBy;
                  if (!candidate) return null;
                  const hasReschedulePending =
                    app.rescheduleRequest?.requestStatus === "pending";

                  return (
                    <div
                      key={app._id}
                      className="p-5 rounded-2xl bg-surface border border-border hover:border-silver/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div>
                        {/* Header with avatar & name */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                candidate.profilePicture ||
                                (candidate.gender === "Female"
                                  ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                                  : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                              }
                              alt={candidate.name}
                              className="w-12 h-12 rounded-xl object-cover border border-border shrink-0 bg-elevated"
                            />
                            <div className="min-w-0">
                              <h3 className="font-display font-bold text-base text-foreground truncate">
                                {candidate.name}
                              </h3>
                              <p className="text-xs font-mono text-foreground/50 flex items-center gap-1 truncate mt-0.5">
                                <Briefcase size={12} className="shrink-0" />{" "}
                                <span className="truncate">{app.job_id?.title || "Position"}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setDrawerApp(app)}
                            className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-elevated transition-colors"
                            title="Quick View Dossier"
                          >
                            <Eye size={15} />
                          </button>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between mb-3">
                          {getStatusBadge(app.status)}
                          <span className="text-[10px] font-mono text-foreground/40">
                            Applied: {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Pending Reschedule Alert inside card */}
                        {hasReschedulePending && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center gap-1.5 mb-3">
                            <Clock size={13} className="shrink-0" /> Reschedule requested
                          </div>
                        )}

                        {/* Contact details */}
                        <div className="space-y-1.5 text-xs font-mono p-3 rounded-xl bg-elevated border border-border">
                          <a
                            href={`mailto:${candidate.email}`}
                            className="flex items-center gap-2 text-foreground/70 hover:text-silver truncate transition-colors"
                          >
                            <Mail size={13} className="text-foreground/40 shrink-0" />
                            <span className="truncate">{candidate.email}</span>
                          </a>
                          {candidate.phone && (
                            <a
                              href={`tel:${candidate.phone}`}
                              className="flex items-center gap-2 text-foreground/70 hover:text-silver truncate transition-colors"
                            >
                              <Phone size={13} className="text-foreground/40 shrink-0" />
                              <span>{candidate.phone}</span>
                            </a>
                          )}
                        </div>

                        {/* Skills preview */}
                        {candidate.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {candidate.skills.slice(0, 3).map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md bg-elevated border border-border text-[10px] font-mono text-foreground/70"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 3 && (
                              <span className="text-[10px] font-mono text-foreground/40 px-1">
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                        <button
                          onClick={() => setDrawerApp(app)}
                          className="px-3 py-1.5 rounded-xl text-xs font-mono bg-elevated border border-border text-foreground hover:bg-surface transition-colors"
                        >
                          Quick View
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/profile/${candidate._id}`, {
                              state: {
                                applicationId: app._id,
                                status: app.status,
                                applicantList: candidateIdList,
                              },
                            })
                          }
                          className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-foreground text-background hover:bg-silver transition-colors inline-flex items-center gap-1"
                        >
                          Full Profile <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* DENSE TABLE VIEW */
              <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="bg-elevated/70 border-b border-border">
                        <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                          Candidate
                        </th>
                        <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                          Applied Job
                        </th>
                        <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                          Contact
                        </th>
                        <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                          Stage
                        </th>
                        <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                          Date
                        </th>
                        <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredApplications.map((app) => {
                        const candidate = app.appliedBy;
                        if (!candidate) return null;

                        return (
                          <tr key={app._id} className="hover:bg-elevated/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    candidate.profilePicture ||
                                    (candidate.gender === "Female"
                                      ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                                      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                                  }
                                  alt={candidate.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-border bg-elevated shrink-0"
                                />
                                <div>
                                  <button
                                    onClick={() => setDrawerApp(app)}
                                    className="font-display font-bold text-sm text-foreground hover:text-silver text-left transition-colors"
                                  >
                                    {candidate.name}
                                  </button>
                                  <p className="text-[10px] font-mono text-foreground/40">
                                    ID: {candidate._id?.substring(candidate._id.length - 6)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <Link
                                to={`/job/${app.job_id?._id}/applicants`}
                                className="font-sans font-medium text-foreground hover:text-silver transition-colors"
                              >
                                {app.job_id?.title || "Position"}
                              </Link>
                            </td>

                            <td className="p-4 font-mono text-foreground/70">
                              <div>{candidate.email}</div>
                              {candidate.phone && (
                                <div className="text-foreground/40">{candidate.phone}</div>
                              )}
                            </td>

                            <td className="p-4 whitespace-nowrap">{getStatusBadge(app.status)}</td>

                            <td className="p-4 font-mono text-foreground/60 whitespace-nowrap">
                              {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                            </td>

                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setDrawerApp(app)}
                                  className="px-2.5 py-1.5 rounded-lg bg-elevated border border-border text-foreground hover:bg-surface font-mono text-xs"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(`/profile/${candidate._id}`, {
                                      state: {
                                        applicationId: app._id,
                                        status: app.status,
                                        applicantList: candidateIdList,
                                      },
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-foreground text-background font-mono text-xs font-bold hover:bg-silver inline-flex items-center gap-1"
                                >
                                  Profile <ChevronRight size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INTERVIEW HUB & CALENDAR WORKSPACE                                 */}
        {/* ========================================================================= */}
        {currentTab === "interviews" && (
          <div className="space-y-6">
            {/* INTERVIEW HUB HERO */}
            <div className="p-6 rounded-3xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-silver">
                  Recruiter Scheduling Hub
                </span>
                <h2 className="text-2xl font-display font-bold text-foreground mt-1">
                  Interview Management & Sessions
                </h2>
                <p className="text-xs font-sans text-foreground/50 mt-1">
                  All active, conducted, and rescheduled interview meetings across your jobs. Timezone: Local System.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-elevated border border-border text-xs font-mono text-foreground">
                  Total Sessions: <strong className="text-silver">{scheduledInterviews.length}</strong>
                </span>
              </div>
            </div>

            {/* INTERVIEW FILTER TABS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Sessions", count: scheduledInterviews.length },
                {
                  id: "upcoming",
                  label: "Upcoming / Scheduled",
                  count: scheduledInterviews.filter((a) => a.status === "Interview Scheduled").length,
                },
                {
                  id: "conducted",
                  label: "Conducted",
                  count: scheduledInterviews.filter((a) => a.status === "Interview Conducted").length,
                },
                {
                  id: "reschedule",
                  label: "Reschedule Requests",
                  count: pendingReschedules.length,
                },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setInterviewFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap border ${
                    interviewFilter === f.id
                      ? "bg-elevated text-foreground border-silver font-bold"
                      : "bg-surface text-foreground/60 border-border hover:text-foreground"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {/* SESSIONS LIST */}
            {scheduledInterviews.length === 0 ? (
              <div className="p-16 rounded-3xl bg-surface border border-border text-center">
                <CalendarClock size={36} className="mx-auto text-foreground/30 mb-3" />
                <h4 className="text-base font-display font-bold text-foreground">
                  No interviews currently on the calendar
                </h4>
                <p className="text-xs font-sans text-foreground/50 mt-1 mb-6 max-w-sm mx-auto">
                  When you shortlist candidates and schedule interviews from any job pipeline, they will appear here.
                </p>
                <button
                  onClick={() => switchTab("roster")}
                  className="px-4 py-2 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors"
                >
                  Browse Candidates & Schedule
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduledInterviews
                  .filter((app) => {
                    if (interviewFilter === "upcoming") return app.status === "Interview Scheduled";
                    if (interviewFilter === "conducted") return app.status === "Interview Conducted";
                    if (interviewFilter === "reschedule") return app.rescheduleRequest?.requestStatus === "pending";
                    return true;
                  })
                  .map((app) => {
                    const candidate = app.appliedBy;
                    if (!candidate) return null;
                    const hasReschedulePending =
                      app.rescheduleRequest?.requestStatus === "pending";

                    return (
                      <div
                        key={app._id}
                        className="p-5 rounded-2xl bg-surface border border-border hover:border-silver/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                      >
                        <div className="space-y-3">
                          {/* Top: Avatar, candidate, job */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  candidate.profilePicture ||
                                  (candidate.gender === "Female"
                                    ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                                    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                                }
                                alt={candidate.name}
                                className="w-12 h-12 rounded-xl object-cover border border-border bg-elevated shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="font-display font-bold text-base text-foreground truncate">
                                  {candidate.name}
                                </h4>
                                <p className="text-xs font-mono text-foreground/50 truncate">
                                  {app.job_id?.title || "Job"}
                                </p>
                              </div>
                            </div>
                            <div>{getStatusBadge(app.status)}</div>
                          </div>

                          {/* Reschedule alert banner */}
                          {hasReschedulePending && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono space-y-1">
                              <span className="font-bold text-amber-300 block uppercase">
                                Alternate Time Requested
                              </span>
                              <p className="text-amber-200/90 text-[11px]">
                                Proposed: {app.rescheduleRequest.proposedTime}
                              </p>
                              <p className="text-amber-200/80 italic text-[11px]">
                                "{app.rescheduleRequest.reason}"
                              </p>
                              <div className="pt-1.5 flex justify-end">
                                <button
                                  onClick={() =>
                                    setActionModal({
                                      show: true,
                                      status: "reschedule_review",
                                      title: `Review Time: ${candidate.name}`,
                                      requireMessage: false,
                                      appId: app._id,
                                      requestData: app.rescheduleRequest,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-mono"
                                >
                                  Respond to Request
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Meeting Link Section */}
                          <div className="p-3 rounded-xl bg-elevated border border-border text-xs font-mono space-y-2">
                            <div className="flex items-center justify-between text-foreground/70">
                              <span>Meeting Mode:</span>
                              <span className="text-foreground font-semibold">
                                {app.meetingLink ? "Online Video" : "Pending Platform"}
                              </span>
                            </div>

                            {app.meetingLink ? (
                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                                <span className="text-foreground/50 truncate max-w-[180px] text-[11px]">
                                  {app.meetingLink}
                                </span>
                                <a
                                  href={app.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 rounded-lg bg-foreground text-background text-xs font-mono font-bold hover:bg-silver transition-colors inline-flex items-center gap-1 shrink-0"
                                >
                                  <Video size={12} /> Launch
                                </a>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setActionModal({
                                    show: true,
                                    status: "Interview Scheduled",
                                    title: `Add Meeting Link: ${candidate.name}`,
                                    requireMessage: true,
                                    appId: app._id,
                                    requestData: null,
                                  });
                                  setMeetingLink(app.meetingLink || "");
                                  setEmployerMessage(app.employerMessage || "");
                                }}
                                className="w-full py-1.5 rounded-lg bg-surface border border-border text-silver hover:bg-elevated text-xs font-mono text-center"
                              >
                                + Attach Meeting Link
                              </button>
                            )}

                            {app.employerMessage && (
                              <div className="pt-2 border-t border-border text-[11px]">
                                <span className="text-foreground/40 block">Notes to Candidate:</span>
                                <p className="text-foreground/80 font-sans italic mt-0.5">
                                  "{app.employerMessage}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                          {app.status !== "Interview Conducted" && (
                            <button
                              onClick={() => {
                                setActionModal({
                                  show: true,
                                  status: "Interview Conducted",
                                  title: `Mark Interview Conducted: ${candidate.name}`,
                                  requireMessage: true,
                                  appId: app._id,
                                  requestData: null,
                                });
                                setEmployerMessage(app.employerMessage || "");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono"
                            >
                              Mark Conducted
                            </button>
                          )}

                          <button
                            onClick={() =>
                              navigate(`/profile/${candidate._id}`, {
                                state: {
                                  applicationId: app._id,
                                  status: app.status,
                                  applicantList: candidateIdList,
                                },
                              })
                            }
                            className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-foreground text-background hover:bg-silver transition-colors inline-flex items-center gap-1 ml-auto"
                          >
                            Dossier <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RECRUITMENT ANALYTICS & HIRING INTELLIGENCE                        */}
        {/* ========================================================================= */}
        {currentTab === "analytics" && (
          <div className="space-y-6">
            {/* KPI METRICS OVERVIEW STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                {
                  label: "Total Applicants",
                  val: analyticsMetrics.total,
                  sub: "Across all jobs",
                  icon: Users,
                },
                {
                  label: "Shortlisted",
                  val: analyticsMetrics.shortlisted,
                  sub: `${analyticsMetrics.shortlistRate}% of pipeline`,
                  icon: CheckSquare,
                },
                {
                  label: "Interviews",
                  val: analyticsMetrics.scheduled,
                  sub: `${analyticsMetrics.conducted} conducted`,
                  icon: CalendarClock,
                },
                {
                  label: "Hired Talent",
                  val: analyticsMetrics.hired,
                  sub: "Signed offers",
                  icon: Award,
                },
                {
                  label: "Conversion Rate",
                  val: `${analyticsMetrics.conversionRate}%`,
                  sub: "Applied to Hired",
                  icon: Percent,
                },
                {
                  label: "Active Jobs",
                  val: uniqueJobs.length,
                  sub: "Open positions",
                  icon: Briefcase,
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
                      <Icon size={16} />
                    </div>
                    <div>
                      <span className="text-2xl font-display font-bold text-foreground">
                        {kpi.val}
                      </span>
                      <span className="block text-[11px] font-mono text-foreground/50 mt-0.5">
                        {kpi.sub}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VISUAL RECRUITMENT FUNNEL */}
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">
                    Hiring Funnel Progression
                  </h3>
                  <p className="text-xs font-sans text-foreground/50">
                    Step-by-step conversion and candidate throughput across all recruitment stages.
                  </p>
                </div>
                <span className="text-xs font-mono text-silver px-3 py-1 rounded-xl bg-elevated border border-border">
                  Telemetry Active
                </span>
              </div>

              {/* Funnel Bars */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    stage: "1. Applications Received",
                    count: analyticsMetrics.total,
                    color: "bg-silver",
                    percent: 100,
                  },
                  {
                    stage: "2. Shortlisted for Review",
                    count: analyticsMetrics.shortlisted,
                    color: "bg-blue-500",
                    percent:
                      analyticsMetrics.total > 0
                        ? Math.round(
                            (analyticsMetrics.shortlisted / analyticsMetrics.total) * 100
                          )
                        : 0,
                  },
                  {
                    stage: "3. Scheduled & Interviewed",
                    count: analyticsMetrics.scheduled,
                    color: "bg-purple-500",
                    percent:
                      analyticsMetrics.total > 0
                        ? Math.round(
                            (analyticsMetrics.scheduled / analyticsMetrics.total) * 100
                          )
                        : 0,
                  },
                  {
                    stage: "4. Final Hires Made",
                    count: analyticsMetrics.hired,
                    color: "bg-emerald-500",
                    percent:
                      analyticsMetrics.total > 0
                        ? Math.round((analyticsMetrics.hired / analyticsMetrics.total) * 100)
                        : 0,
                  },
                ].map((step, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-foreground/80 font-bold">{step.stage}</span>
                      <span className="text-foreground/50">
                        {step.count} candidates &bull; {step.percent}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-elevated rounded-full overflow-hidden border border-border">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${step.percent}%` }}
                        transition={{ duration: 0.6, delay: sIdx * 0.1 }}
                        className={`h-full ${step.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* APPLICATION VOLUME PER JOB BREAKDOWN */}
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
              <h3 className="text-lg font-display font-bold text-foreground border-b border-border pb-4">
                Application Volume by Position
              </h3>

              {analyticsMetrics.jobBreakdown.length === 0 ? (
                <p className="text-xs font-mono text-foreground/40 text-center py-8">
                  No position data available yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {analyticsMetrics.jobBreakdown.map((item, jIdx) => {
                    const maxApps = Math.max(
                      ...analyticsMetrics.jobBreakdown.map((j) => j.count),
                      1
                    );
                    const widthPercent = Math.min(100, Math.round((item.count / maxApps) * 100));

                    return (
                      <div
                        key={jIdx}
                        className="p-3.5 rounded-xl bg-elevated border border-border space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-display font-bold text-foreground">
                            {item.title}
                          </span>
                          <span className="font-mono text-foreground/60">
                            {item.count} applications &bull; {item.hired} hired &bull;{" "}
                            {item.interviews} interviews
                          </span>
                        </div>
                        <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-silver rounded-full"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TEAM & ACCESS MANAGEMENT                                           */}
        {/* ========================================================================= */}
        {currentTab === "team" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-silver">
                  Recruiting Permissions
                </span>
                <h2 className="text-2xl font-display font-bold text-foreground mt-1">
                  Team Members & Hiring Access
                </h2>
                <p className="text-xs font-sans text-foreground/50 mt-1">
                  Manage recruiter and interviewer seats to collaborate on applicant reviews and scheduling.
                </p>
              </div>

              <button
                onClick={() => setInviteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={14} /> Invite Collaborator
              </button>
            </div>

            {/* TEAM ROSTER TABLE */}
            <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-elevated/70 border-b border-border">
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Member Name
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Email
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Role & Permissions
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="p-4 font-mono text-[11px] text-foreground/60 uppercase tracking-widest">
                      Added Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-elevated/50 transition-colors">
                      <td className="p-4 font-display font-bold text-foreground">
                        {member.name}
                      </td>
                      <td className="p-4 font-mono text-foreground/70">{member.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider border ${
                            member.role === "Admin"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold"
                              : member.role === "Recruiter"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-surface text-foreground/70 border-border"
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-emerald-400 font-bold">
                        {member.status}
                      </td>
                      <td className="p-4 font-mono text-foreground/50">{member.addedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CANDIDATE QUICK PREVIEW SLIDE-OVER DRAWER                                 */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {drawerApp && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
              onClick={() => setDrawerApp(null)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl bg-surface border-l border-border h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl"
              >
                <div className="space-y-6">
                  {/* Drawer Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          drawerApp.appliedBy?.profilePicture ||
                          (drawerApp.appliedBy?.gender === "Female"
                            ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                            : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                        }
                        alt="Candidate"
                        className="w-14 h-14 rounded-2xl object-cover border border-border bg-elevated"
                      />
                      <div>
                        <h3 className="font-display font-bold text-lg text-foreground">
                          {drawerApp.appliedBy?.name}
                        </h3>
                        <p className="text-xs font-mono text-silver">
                          Applied for: {drawerApp.job_id?.title || "Position"}
                        </p>
                        <div className="mt-1">{getStatusBadge(drawerApp.status)}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDrawerApp(null)}
                      className="p-2 rounded-xl bg-elevated text-foreground/60 hover:text-foreground transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="p-4 rounded-xl bg-elevated border border-border space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-foreground/70">
                      <span>Email:</span>
                      <a href={`mailto:${drawerApp.appliedBy?.email}`} className="text-silver hover:underline">
                        {drawerApp.appliedBy?.email}
                      </a>
                    </div>
                    {drawerApp.appliedBy?.phone && (
                      <div className="flex items-center justify-between text-foreground/70">
                        <span>Phone:</span>
                        <a href={`tel:${drawerApp.appliedBy?.phone}`} className="text-silver hover:underline">
                          {drawerApp.appliedBy?.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-foreground/70">
                      <span>Applied Date:</span>
                      <span className="text-foreground">
                        {new Date(drawerApp.createdAt || drawerApp.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Candidate Skills */}
                  {drawerApp.appliedBy?.skills?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/60 mb-2">
                        Skills & Competencies
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {drawerApp.appliedBy.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-elevated border border-border text-xs font-mono text-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Candidate Pitch */}
                  {drawerApp.applicantMessage && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <h4 className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <MessageSquareQuote size={14} /> Candidate Pitch
                      </h4>
                      <p className="text-xs font-sans text-amber-100/90 whitespace-pre-wrap leading-relaxed">
                        "{drawerApp.applicantMessage}"
                      </p>
                    </div>
                  )}

                  {/* Screening Answers */}
                  {drawerApp.screeningAnswers?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare size={14} /> Screening Question Responses
                      </h4>
                      {drawerApp.screeningAnswers.map((qa, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-elevated border border-border text-xs space-y-1"
                        >
                          <p className="font-semibold text-foreground">Q: {qa.question}</p>
                          <p className="font-mono text-foreground/70 bg-surface p-2 rounded-lg border border-border">
                            A: {qa.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-6 border-t border-border space-y-3 mt-6">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setActionModal({
                          show: true,
                          status: "shortlisted",
                          title: `Shortlist ${drawerApp.appliedBy?.name}`,
                          requireMessage: true,
                          appId: drawerApp._id,
                          requestData: null,
                        });
                        setEmployerMessage(drawerApp.employerMessage || "");
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 text-xs font-mono uppercase tracking-wider font-bold transition-colors"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => {
                        setActionModal({
                          show: true,
                          status: "Interview Scheduled",
                          title: `Schedule Interview: ${drawerApp.appliedBy?.name}`,
                          requireMessage: true,
                          appId: drawerApp._id,
                          requestData: null,
                        });
                        setEmployerMessage(drawerApp.employerMessage || "");
                        setMeetingLink(drawerApp.meetingLink || "");
                      }}
                      className="px-3 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-mono uppercase tracking-wider font-bold transition-colors"
                    >
                      Schedule Interview
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigate(`/profile/${drawerApp.appliedBy?._id}`, {
                        state: {
                          applicationId: drawerApp._id,
                          status: drawerApp.status,
                          applicantList: candidateIdList,
                        },
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors flex items-center justify-center gap-1.5"
                  >
                    Open Candidate Dossier <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* STATUS & RESCHEDULE MODAL                                                 */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {actionModal.show && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
              >
                <h3 className="text-lg font-display font-bold text-foreground mb-1">
                  {actionModal.title}
                </h3>
                <p className="text-xs font-mono text-foreground/50 mb-4">
                  Stage: <span className="text-silver uppercase">{actionModal.status}</span>
                </p>

                {actionModal.status === "reschedule_review" ? (
                  <div className="mb-6 space-y-4">
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-xs font-mono">
                      <p className="text-amber-200">
                        <strong className="text-amber-300">Reason:</strong>{" "}
                        {actionModal.requestData?.reason}
                      </p>
                      <p className="text-amber-200">
                        <strong className="text-amber-300">Proposed Time:</strong>{" "}
                        {actionModal.requestData?.proposedTime}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-foreground/70 mb-1.5 uppercase">
                        Response Note to Candidate
                      </label>
                      <textarea
                        value={employerMessage}
                        onChange={(e) => setEmployerMessage(e.target.value)}
                        placeholder="State your confirmation or alternative meeting proposal..."
                        className="w-full p-3 bg-elevated border border-border rounded-xl text-xs font-sans text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver h-24 resize-y"
                      />
                    </div>
                  </div>
                ) : actionModal.requireMessage ? (
                  <div className="mb-6 space-y-3">
                    {actionModal.status === "Interview Scheduled" && (
                      <div>
                        <label className="block text-xs font-mono text-foreground/70 mb-1.5 uppercase">
                          Meeting Link
                        </label>
                        <input
                          type="url"
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          placeholder="https://meet.google.com/..."
                          className="w-full p-3 bg-elevated border border-border rounded-xl text-xs font-mono text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-mono text-foreground/70 mb-1.5 uppercase">
                        Message to Candidate
                      </label>
                      <textarea
                        value={employerMessage}
                        onChange={(e) => setEmployerMessage(e.target.value)}
                        placeholder="Instructions, agenda, or next steps..."
                        className="w-full p-3 bg-elevated border border-border rounded-xl text-xs font-sans text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver h-28 resize-y"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-sans text-foreground/70 mb-6">
                    Confirm updating this application to{" "}
                    <strong className="text-silver uppercase">{actionModal.status}</strong>?
                  </p>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setActionModal({
                        show: false,
                        status: "",
                        title: "",
                        requireMessage: false,
                        appId: null,
                        requestData: null,
                      });
                      setEmployerMessage("");
                      setMeetingLink("");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-mono border border-border text-foreground hover:bg-elevated transition-colors"
                  >
                    Cancel
                  </button>

                  {actionModal.status === "reschedule_review" ? (
                    <>
                      <button
                        onClick={() => handleRescheduleResponse("rejected")}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRescheduleResponse("approved")}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
                      >
                        {actionLoading ? (
                          <Loader2 className="animate-spin" size={13} />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}{" "}
                        Approve Time
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleStatusUpdate}
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-background bg-foreground hover:bg-silver transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                    >
                      {actionLoading ? (
                        <Loader2 className="animate-spin" size={13} />
                      ) : (
                        <CheckSquare size={14} />
                      )}{" "}
                      Confirm
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* INVITE TEAM MEMBER MODAL                                                 */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {inviteModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-display font-bold text-foreground">
                    Invite Collaborator
                  </h3>
                  <button
                    onClick={() => setInviteModalOpen(false)}
                    className="p-1 rounded-lg text-foreground/40 hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddTeamMember} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-foreground/70 mb-1 uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newInvite.name}
                      onChange={(e) => setNewInvite({ ...newInvite, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-foreground/70 mb-1 uppercase">
                      Company Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newInvite.email}
                      onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                      placeholder="alex@company.com"
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-foreground/70 mb-1 uppercase">
                      Role
                    </label>
                    <select
                      value={newInvite.role}
                      onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none focus:border-silver cursor-pointer"
                    >
                      <option value="Recruiter">Recruiter (Review & Schedule)</option>
                      <option value="Interviewer">Interviewer (Take Notes & Feedback)</option>
                      <option value="Admin">Admin (Full Job & Team Permissions)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-mono border border-border text-foreground hover:bg-elevated transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-background bg-foreground hover:bg-silver transition-colors"
                    >
                      Send Invitation
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </EmployerLayout>
  );
}
