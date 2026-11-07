import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  ChevronRight,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  CheckSquare,
  MessageSquareQuote,
  X,
  Search,
  SlidersHorizontal,
  LayoutList,
  Columns3,
  Calendar,
  Download,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Briefcase,
  CalendarClock,
  Send,
  Video,
  Eye,
  Filter,
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

export default function JobApplicants() {
  const { id } = useParams(); // Job ID
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "name"
  const [viewMode, setViewMode] = useState("table"); // "table", "kanban", "interviews"

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDetails, setJobDetails] = useState(null);

  // Multi-selection state
  const [selectedApps, setSelectedApps] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals & Drawers
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
  const [pitchModal, setPitchModal] = useState({
    show: false,
    message: "",
    name: "",
  });
  const [assessmentModal, setAssessmentModal] = useState({
    show: false,
    answers: [],
    name: "",
  });

  // Candidate Quick-View Drawer
  const [drawerCandidate, setDrawerCandidate] = useState(null);

  // Fetch applicants and job info
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) return navigate("/login");

        const { token } = JSON.parse(stored);
        const headers = { Authorization: `Bearer ${token}` };

        const [appRes, jobRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/applications/job/${id}`, { headers }),
          axios.get(`${API_BASE_URL}/jobs/${id}`, { headers }),
        ]);

        setApplicants(appRes.data || []);
        const fetchedJob = jobRes.data.job || jobRes.data;
        setJobDetails(fetchedJob);
        setJobTitle(fetchedJob?.title || "Job");
      } catch (err) {
        console.error("Failed to load applicants", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id, navigate]);

  // Synchronize statusFilter with searchParams
  useEffect(() => {
    const urlStatus = searchParams.get("status") || "all";
    setStatusFilter(urlStatus);
  }, [searchParams]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    if (status === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", status);
    }
    setSearchParams(searchParams);
  };

  // Filtered & sorted applicants
  const displayApplicants = useMemo(() => {
    const filtered = applicants.filter((app) => {
      const candidate = app.appliedBy || app.applicant;
      const candidateName = candidate?.name?.toLowerCase() || "";
      const candidateEmail = candidate?.email?.toLowerCase() || "";
      const matchesSearch =
        candidateName.includes(searchQuery.toLowerCase()) ||
        candidateEmail.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        const nameA = (a.appliedBy?.name || a.applicant?.name || "").toLowerCase();
        const nameB = (b.appliedBy?.name || b.applicant?.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      const dateA = new Date(a.createdAt || a.appliedAt).getTime();
      const dateB = new Date(b.createdAt || b.appliedAt).getTime();
      return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
    });
  }, [applicants, searchQuery, statusFilter, sortBy]);

  // Pipeline counts
  const countsByStatus = useMemo(() => {
    const counts = {
      all: applicants.length,
      applied: 0,
      shortlisted: 0,
      "Interview Scheduled": 0,
      "Interview Conducted": 0,
      "Assignment Scheduled": 0,
      hired: 0,
      NCTT: 0,
    };
    applicants.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status] += 1;
      }
    });
    return counts;
  }, [applicants]);

  // Multi-select handlers
  const handleSelectAll = () => {
    if (selectedApps.length === displayApplicants.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(displayApplicants.map((app) => app._id));
    }
  };

  const handleSelectOne = (appId) => {
    if (selectedApps.includes(appId)) {
      setSelectedApps(selectedApps.filter((i) => i !== appId));
    } else {
      setSelectedApps([...selectedApps, appId]);
    }
  };

  // Bulk status update
  const handleBulkStatusUpdate = async () => {
    if (selectedApps.length === 0) return;
    setActionLoading(true);

    try {
      const stored = localStorage.getItem("employerInfo");
      const { token } = JSON.parse(stored);

      await Promise.all(
        selectedApps.map((appId) =>
          axios.patch(
            `${API_BASE_URL}/applications/${appId}/status`,
            { status: actionModal.status, employerMessage, meetingLink },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setApplicants((prev) =>
        prev.map((app) =>
          selectedApps.includes(app._id)
            ? { ...app, status: actionModal.status, employerMessage, meetingLink }
            : app
        )
      );

      // Also update drawer if open
      if (drawerCandidate && selectedApps.includes(drawerCandidate._id)) {
        setDrawerCandidate((prev) => ({
          ...prev,
          status: actionModal.status,
          employerMessage,
          meetingLink,
        }));
      }

      setSelectedApps([]);
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
    } catch (error) {
      console.error("Bulk status update failed", error);
      alert("Failed to update candidate status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Single candidate status update trigger
  const triggerSingleStatus = (app, status, title, requireMessage = false) => {
    setSelectedApps([app._id]);
    setActionModal({
      show: true,
      status,
      title: `${title}: ${app.appliedBy?.name || app.applicant?.name || "Candidate"}`,
      requireMessage,
      appId: app._id,
      requestData: null,
    });
    setEmployerMessage(app.employerMessage || "");
    setMeetingLink(app.meetingLink || "");
  };

  // Reschedule review handler
  const handleRescheduleResponse = async (action) => {
    setActionLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("employerInfo")).token;
      await axios.patch(
        `${API_BASE_URL}/applications/${actionModal.appId}/reschedule/respond`,
        { action, employerMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplicants((prev) =>
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

      if (drawerCandidate?._id === actionModal.appId) {
        setDrawerCandidate((prev) => ({
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

  // Scheduled interviews subset
  const interviewApplicants = useMemo(() => {
    return applicants.filter(
      (app) =>
        app.status === "Interview Scheduled" ||
        app.status === "Interview Conducted" ||
        app.rescheduleRequest?.isRequested
    );
  }, [applicants]);

  const masterCandidateIdList = useMemo(() => {
    return displayApplicants
      .map((a) => a.appliedBy?._id || a.applicant?._id)
      .filter(Boolean);
  }, [displayApplicants]);

  if (loading) {
    return (
      <EmployerLayout activeTab="my-candidates">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-silver mb-3" size={36} />
          <p className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
            Loading Applicant Dossiers...
          </p>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout activeTab="my-candidates">
      <div className="space-y-6 pb-20">
        {/* HEADER & JOB INFO BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest text-foreground/60 hover:text-foreground transition-colors uppercase"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <span className="text-foreground/30 font-mono">/</span>
              <span className="text-xs font-mono text-silver uppercase">
                Applicant Pipeline
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
                Applicants for {jobTitle}
              </h1>
              {jobDetails?.status && (
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border ${
                    jobDetails.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-surface text-foreground/60 border-border"
                  }`}
                >
                  {jobDetails.status}
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-foreground/50 mt-1">
              Job ID: <span className="text-silver">{id}</span> &bull; Total Applications:{" "}
              <span className="text-foreground font-semibold">{applicants.length}</span>
            </p>
          </div>

          {/* VIEW SWITCHER & QUICK ACTIONS */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-surface border border-border">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  viewMode === "table"
                    ? "bg-elevated text-foreground shadow-sm font-bold border border-border"
                    : "text-foreground/60 hover:text-foreground"
                }`}
                title="Structured Table View"
              >
                <LayoutList size={14} /> Table
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  viewMode === "kanban"
                    ? "bg-elevated text-foreground shadow-sm font-bold border border-border"
                    : "text-foreground/60 hover:text-foreground"
                }`}
                title="Kanban Pipeline Stages"
              >
                <Columns3 size={14} /> Kanban
              </button>
              <button
                onClick={() => setViewMode("interviews")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  viewMode === "interviews"
                    ? "bg-elevated text-foreground shadow-sm font-bold border border-border"
                    : "text-foreground/60 hover:text-foreground"
                }`}
                title="Scheduled Interviews"
              >
                <CalendarClock size={14} /> Interviews ({interviewApplicants.length})
              </button>
            </div>

            <Link
              to={`/job/${id}`}
              className="px-3.5 py-2 rounded-xl text-xs font-mono border border-border bg-surface text-foreground hover:bg-elevated transition-colors inline-flex items-center gap-1.5"
            >
              <Briefcase size={14} /> Job Details
            </Link>
          </div>
        </div>

        {/* PIPELINE STAGE METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { id: "all", label: "All Candidates", count: countsByStatus.all },
            { id: "applied", label: "Applied", count: countsByStatus.applied },
            { id: "shortlisted", label: "Shortlisted", count: countsByStatus.shortlisted },
            {
              id: "Interview Scheduled",
              label: "Interviewing",
              count: countsByStatus["Interview Scheduled"],
            },
            {
              id: "Interview Conducted",
              label: "Conducted",
              count: countsByStatus["Interview Conducted"],
            },
            {
              id: "Assignment Scheduled",
              label: "Assignment",
              count: countsByStatus["Assignment Scheduled"],
            },
            { id: "hired", label: "Hired", count: countsByStatus.hired },
            { id: "NCTT", label: "Not a Fit", count: countsByStatus.NCTT },
          ].map((stage) => {
            const isActive = statusFilter === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => handleStatusFilterChange(stage.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-elevated border-silver shadow-md"
                    : "bg-surface border-border hover:border-border/80"
                }`}
              >
                <span className="block text-[10px] font-mono uppercase tracking-wider text-foreground/50 truncate">
                  {stage.label}
                </span>
                <span className="block text-lg font-display font-bold text-foreground mt-0.5">
                  {stage.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH, SORT, AND FILTER CONTROLS */}
        <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter applicants by name or email address..."
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

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-foreground/50 uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-elevated border border-border text-foreground text-xs font-mono px-3 py-2 rounded-xl focus:outline-none focus:border-silver cursor-pointer"
              >
                <option value="newest">Newest Applied</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Candidate Name A-Z</option>
              </select>
            </div>

            <div className="text-xs font-mono text-foreground/60 px-3 py-2 rounded-xl bg-elevated border border-border">
              Displaying: <strong className="text-foreground">{displayApplicants.length}</strong>
            </div>
          </div>
        </div>

        {/* RESCHEDULE ALERT NOTIFICATION IF PENDING */}
        {applicants.some((a) => a.rescheduleRequest?.requestStatus === "pending") && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="text-amber-400 mt-0.5 shrink-0" size={18} />
              <div>
                <h4 className="text-sm font-display font-bold text-amber-300">
                  Interview Reschedule Requests Pending
                </h4>
                <p className="text-xs font-sans text-amber-200/80 mt-0.5">
                  One or more candidates have proposed an alternative interview time slot. Review their requests to approve or decline.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setStatusFilter("all");
                setViewMode("interviews");
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-mono uppercase tracking-wider shrink-0 transition-colors"
            >
              Review Interviews
            </button>
          </div>
        )}

        {/* MAIN VIEWPORT: TABLE / KANBAN / INTERVIEWS */}
        {displayApplicants.length === 0 ? (
          <div className="p-16 rounded-3xl bg-surface border border-border text-center">
            <div className="w-16 h-16 rounded-2xl bg-elevated border border-border flex items-center justify-center mx-auto mb-4 text-foreground/40">
              <User size={28} />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">
              No matching applicants found
            </h3>
            <p className="text-xs font-sans text-foreground/50 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search criteria or resetting the stage filter to view all candidates."
                : "Candidates who apply for this position will appear directly in this applicant pipeline."}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleStatusFilterChange("all");
                }}
                className="px-4 py-2 rounded-xl bg-elevated border border-border text-xs font-mono text-foreground hover:bg-surface transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : viewMode === "table" ? (
          /* ========================================================================= */
          /* 1. STRUCTURED APPLICANT TABLE VIEW                                         */
          /* ========================================================================= */
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-elevated/70 border-b border-border">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedApps.length === displayApplicants.length &&
                          displayApplicants.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-border text-foreground accent-silver cursor-pointer"
                        title="Select All Displayed Candidates"
                      />
                    </th>
                    <th className="p-4 text-[11px] font-mono text-foreground/60 uppercase tracking-widest">
                      Candidate
                    </th>
                    <th className="p-4 text-[11px] font-mono text-foreground/60 uppercase tracking-widest">
                      Contact
                    </th>
                    <th className="p-4 text-[11px] font-mono text-foreground/60 uppercase tracking-widest">
                      Applied Date
                    </th>
                    <th className="p-4 text-[11px] font-mono text-foreground/60 uppercase tracking-widest">
                      Stage / Status
                    </th>
                    <th className="p-4 text-[11px] font-mono text-foreground/60 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-sans">
                  {displayApplicants.map((app) => {
                    const candidate = app.appliedBy || app.applicant;
                    if (!candidate) return null;
                    const isSelected = selectedApps.includes(app._id);
                    const hasReschedulePending =
                      app.rescheduleRequest?.requestStatus === "pending";

                    return (
                      <tr
                        key={app._id}
                        className={`hover:bg-elevated/50 transition-colors ${
                          isSelected ? "bg-elevated/70" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(app._id)}
                            className="w-4 h-4 rounded border-border text-foreground accent-silver cursor-pointer"
                          />
                        </td>

                        {/* Candidate Identity */}
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
                              className="w-10 h-10 rounded-xl object-cover border border-border shrink-0 bg-surface"
                            />
                            <div className="min-w-0">
                              <button
                                onClick={() => setDrawerCandidate(app)}
                                className="font-display font-bold text-sm text-foreground hover:text-silver text-left transition-colors flex items-center gap-1.5"
                              >
                                {candidate.name}
                                <Eye size={13} className="text-foreground/40 hover:text-silver" />
                              </button>
                              <div className="flex items-center gap-2 mt-0.5">
                                {candidate.skills?.length > 0 ? (
                                  <span className="text-[10px] font-mono text-foreground/50 truncate max-w-[200px]">
                                    {candidate.skills.slice(0, 3).join(", ")}
                                    {candidate.skills.length > 3 &&
                                      ` +${candidate.skills.length - 3}`}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-foreground/40">
                                    No skills listed
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact details */}
                        <td className="p-4">
                          <div className="space-y-1 text-foreground/70">
                            <a
                              href={`mailto:${candidate.email}`}
                              className="flex items-center gap-1.5 hover:text-silver transition-colors truncate max-w-[220px]"
                            >
                              <Mail size={12} className="text-foreground/40 shrink-0" />
                              <span className="truncate">{candidate.email}</span>
                            </a>
                            {candidate.phone && (
                              <a
                                href={`tel:${candidate.phone}`}
                                className="flex items-center gap-1.5 hover:text-silver transition-colors"
                              >
                                <Phone size={12} className="text-foreground/40 shrink-0" />
                                <span>{candidate.phone}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Applied On */}
                        <td className="p-4 font-mono text-foreground/60 whitespace-nowrap">
                          {new Date(app.createdAt || app.appliedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Status badge */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {getStatusBadge(app.status)}
                            {hasReschedulePending && (
                              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold">
                                <Clock size={11} /> Reschedule Requested
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Contextual Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Pitch Button */}
                            {app.applicantMessage && (
                              <button
                                onClick={() =>
                                  setPitchModal({
                                    show: true,
                                    message: app.applicantMessage,
                                    name: candidate.name,
                                  })
                                }
                                className="p-2 rounded-lg bg-elevated border border-border text-amber-400 hover:border-amber-500/40 transition-colors"
                                title="Read Candidate Pitch"
                              >
                                <MessageSquareQuote size={14} />
                              </button>
                            )}

                            {/* Assessment Button */}
                            {app.screeningAnswers && app.screeningAnswers.length > 0 && (
                              <button
                                onClick={() =>
                                  setAssessmentModal({
                                    show: true,
                                    answers: app.screeningAnswers,
                                    name: candidate.name,
                                  })
                                }
                                className="p-2 rounded-lg bg-elevated border border-border text-blue-400 hover:border-blue-500/40 transition-colors"
                                title="View Screening Questions & Answers"
                              >
                                <CheckSquare size={14} />
                              </button>
                            )}

                            {/* Reschedule Review Button */}
                            {hasReschedulePending && (
                              <button
                                onClick={() =>
                                  setActionModal({
                                    show: true,
                                    status: "reschedule_review",
                                    title: `Review Time Request: ${candidate.name}`,
                                    requireMessage: false,
                                    appId: app._id,
                                    requestData: app.rescheduleRequest,
                                  })
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-mono flex items-center gap-1 transition-colors animate-pulse"
                                title="Review Reschedule Proposal"
                              >
                                <Clock size={12} /> Time Review
                              </button>
                            )}

                            {/* Quick Status dropdown or button */}
                            <button
                              onClick={() => setDrawerCandidate(app)}
                              className="px-3 py-1.5 rounded-lg bg-elevated border border-border text-foreground hover:bg-surface transition-colors font-mono text-xs"
                            >
                              Details
                            </button>

                            {/* Navigate to full candidate profile */}
                            <button
                              onClick={() => {
                                navigate(`/profile/${candidate._id}`, {
                                  state: {
                                    applicationId: app._id,
                                    status: app.status,
                                    applicantList: masterCandidateIdList,
                                  },
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors inline-flex items-center gap-1"
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
        ) : viewMode === "kanban" ? (
          /* ========================================================================= */
          /* 2. KANBAN PIPELINE VIEW                                                   */
          /* ========================================================================= */
          <div className="overflow-x-auto pb-6">
            <div className="flex gap-4 min-w-[1200px]">
              {[
                { id: "applied", label: "Applied", color: "border-border" },
                { id: "shortlisted", label: "Shortlisted", color: "border-blue-500/30" },
                {
                  id: "Interview Scheduled",
                  label: "Interviewing",
                  color: "border-purple-500/30",
                },
                {
                  id: "Interview Conducted",
                  label: "Conducted",
                  color: "border-cyan-500/30",
                },
                {
                  id: "Assignment Scheduled",
                  label: "Assignment",
                  color: "border-amber-500/30",
                },
                { id: "hired", label: "Hired", color: "border-emerald-500/30" },
                { id: "NCTT", label: "Not a Fit", color: "border-rose-500/30" },
              ].map((column) => {
                const columnApps = applicants.filter((a) => a.status === column.id);
                return (
                  <div
                    key={column.id}
                    className="w-80 flex-shrink-0 bg-surface border border-border rounded-2xl p-4 flex flex-col max-h-[75vh]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase font-bold text-foreground">
                          {column.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-elevated border border-border text-[10px] font-mono text-foreground/70">
                          {columnApps.length}
                        </span>
                      </div>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {columnApps.length === 0 ? (
                        <div className="py-8 text-center text-xs font-mono text-foreground/30 border border-dashed border-border rounded-xl">
                          No candidates
                        </div>
                      ) : (
                        columnApps.map((app) => {
                          const candidate = app.appliedBy || app.applicant;
                          if (!candidate) return null;
                          return (
                            <div
                              key={app._id}
                              className="p-3.5 rounded-xl bg-elevated border border-border hover:border-silver/50 transition-all shadow-sm space-y-2.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={
                                      candidate.profilePicture ||
                                      (candidate.gender === "Female"
                                        ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                                        : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                                    }
                                    alt={candidate.name}
                                    className="w-8 h-8 rounded-lg object-cover border border-border shrink-0"
                                  />
                                  <span className="font-display font-bold text-xs text-foreground truncate">
                                    {candidate.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() => setDrawerCandidate(app)}
                                  className="text-foreground/40 hover:text-foreground text-xs"
                                  title="Quick View"
                                >
                                  <Eye size={13} />
                                </button>
                              </div>

                              <p className="text-[11px] font-mono text-foreground/50 truncate">
                                {candidate.email}
                              </p>

                              {/* Skills */}
                              {candidate.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {candidate.skills.slice(0, 2).map((skill, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-1.5 py-0.5 rounded bg-surface border border-border text-[9px] font-mono text-foreground/70"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {candidate.skills.length > 2 && (
                                    <span className="text-[9px] font-mono text-foreground/40">
                                      +{candidate.skills.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Card action controls */}
                              <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono">
                                <span className="text-foreground/40">
                                  {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      triggerSingleStatus(
                                        app,
                                        "shortlisted",
                                        "Shortlist",
                                        true
                                      )
                                    }
                                    className="px-2 py-0.5 rounded bg-surface hover:bg-elevated text-blue-400 border border-border"
                                    title="Shortlist"
                                  >
                                    Shortlist
                                  </button>
                                  <button
                                    onClick={() =>
                                      triggerSingleStatus(
                                        app,
                                        "Interview Scheduled",
                                        "Schedule Interview",
                                        true
                                      )
                                    }
                                    className="px-2 py-0.5 rounded bg-surface hover:bg-elevated text-purple-400 border border-border"
                                    title="Interview"
                                  >
                                    Interview
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 3. SCHEDULED INTERVIEWS VIEW                                              */
          /* ========================================================================= */
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">
                  Interview Roster for {jobTitle}
                </h3>
                <p className="text-xs font-sans text-foreground/50 mt-1">
                  Candidates in this pipeline who are currently scheduled or awaiting interview reviews.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-silver px-3 py-1.5 rounded-xl bg-elevated border border-border">
                  {interviewApplicants.length} Scheduled Sessions
                </span>
              </div>
            </div>

            {interviewApplicants.length === 0 ? (
              <div className="p-16 rounded-3xl bg-surface border border-border text-center">
                <CalendarClock size={36} className="mx-auto text-foreground/30 mb-3" />
                <h4 className="text-base font-display font-bold text-foreground">
                  No interviews scheduled yet
                </h4>
                <p className="text-xs font-sans text-foreground/50 mt-1 mb-4">
                  Select candidates from the applicant list to schedule technical or screening interviews.
                </p>
                <button
                  onClick={() => setViewMode("table")}
                  className="px-4 py-2 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors"
                >
                  Return to Table & Schedule
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviewApplicants.map((app) => {
                  const candidate = app.appliedBy || app.applicant;
                  if (!candidate) return null;
                  const hasReschedulePending =
                    app.rescheduleRequest?.requestStatus === "pending";

                  return (
                    <div
                      key={app._id}
                      className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between space-y-4 hover:border-silver/40 transition-all"
                    >
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
                            className="w-12 h-12 rounded-xl object-cover border border-border"
                          />
                          <div>
                            <h4 className="font-display font-bold text-base text-foreground">
                              {candidate.name}
                            </h4>
                            <p className="text-xs font-mono text-foreground/50">
                              {candidate.email}
                            </p>
                            {candidate.phone && (
                              <p className="text-xs font-mono text-foreground/40">
                                {candidate.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">{getStatusBadge(app.status)}</div>
                      </div>

                      {/* Reschedule Request Notice */}
                      {hasReschedulePending && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                              Candidate Reschedule Request
                            </span>
                            <span className="text-[10px] font-mono text-amber-300">
                              Proposed: {app.rescheduleRequest.proposedTime}
                            </span>
                          </div>
                          <p className="text-xs font-sans text-amber-200/90 italic">
                            "{app.rescheduleRequest.reason}"
                          </p>
                          <div className="flex justify-end gap-2 pt-1">
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
                              className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-mono border border-amber-500/40"
                            >
                              Respond to Request
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Meeting details */}
                      <div className="p-3 rounded-xl bg-elevated border border-border text-xs font-mono space-y-1.5">
                        <div className="flex items-center justify-between text-foreground/70">
                          <span>Interview Platform:</span>
                          <span className="text-foreground font-semibold">
                            {app.meetingLink ? "Online Video" : "Pending Link"}
                          </span>
                        </div>
                        {app.meetingLink && (
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <span className="text-foreground/50 truncate max-w-[200px]">
                              {app.meetingLink}
                            </span>
                            <a
                              href={app.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded bg-foreground text-background text-[11px] font-bold hover:bg-silver transition-colors inline-flex items-center gap-1 shrink-0"
                            >
                              <Video size={12} /> Launch
                            </a>
                          </div>
                        )}
                        {app.employerMessage && (
                          <div className="pt-2 border-t border-border text-[11px] text-foreground/60">
                            <span className="text-foreground/40 block">Message to Candidate:</span>
                            <p className="text-foreground/80 font-sans italic mt-0.5">
                              "{app.employerMessage}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Stage management */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                        <button
                          onClick={() =>
                            triggerSingleStatus(
                              app,
                              "Interview Conducted",
                              "Mark Interview Conducted",
                              true
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono transition-colors"
                        >
                          Mark Conducted
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              triggerSingleStatus(app, "hired", "Hire Candidate", false)
                            }
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono font-bold transition-colors"
                          >
                            Hire
                          </button>
                          <button
                            onClick={() =>
                              triggerSingleStatus(
                                app,
                                "NCTT",
                                "Mark as Not a Fit (NCTT)",
                                false
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-mono transition-colors"
                          >
                            NCTT
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* BULK ACTIONS FLOATING TOOLBAR                                            */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {selectedApps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-silver/50 shadow-2xl flex flex-wrap items-center gap-3 max-w-2xl w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-elevated border border-border text-xs font-mono font-bold text-foreground">
                  {selectedApps.length}
                </span>
                <span className="text-xs font-mono text-foreground/70 hidden sm:inline">
                  Selected Candidates
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "shortlisted",
                      title: "Shortlist Candidates",
                      requireMessage: true,
                    })
                  }
                  className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Shortlist
                </button>
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "Interview Scheduled",
                      title: "Schedule Interviews",
                      requireMessage: true,
                    })
                  }
                  className="px-3 py-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Interview
                </button>
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "Interview Conducted",
                      title: "Mark Interview Conducted",
                      requireMessage: true,
                    })
                  }
                  className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Conducted
                </button>
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "Assignment Scheduled",
                      title: "Schedule Assignments",
                      requireMessage: true,
                    })
                  }
                  className="px-3 py-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Assignment
                </button>
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "NCTT",
                      title: "Mark Candidates as Not a Fit (NCTT)",
                      requireMessage: false,
                    })
                  }
                  className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  NCTT
                </button>
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "hired",
                      title: "Mark Candidates as Hired",
                      requireMessage: false,
                    })
                  }
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors shadow-sm"
                >
                  Hire
                </button>
                <button
                  onClick={() => setSelectedApps([])}
                  className="p-1.5 text-foreground/40 hover:text-foreground transition-colors ml-1"
                  title="Deselect All"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* CANDIDATE QUICK PREVIEW SLIDE-OVER DRAWER                                 */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {drawerCandidate && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
              onClick={() => setDrawerCandidate(null)}
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
                          (drawerCandidate.appliedBy || drawerCandidate.applicant)?.profilePicture ||
                          ((drawerCandidate.appliedBy || drawerCandidate.applicant)?.gender === "Female"
                            ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                            : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                        }
                        alt="Candidate"
                        className="w-14 h-14 rounded-2xl object-cover border border-border"
                      />
                      <div>
                        <h3 className="font-display font-bold text-lg text-foreground">
                          {(drawerCandidate.appliedBy || drawerCandidate.applicant)?.name}
                        </h3>
                        <p className="text-xs font-mono text-foreground/50">
                          {(drawerCandidate.appliedBy || drawerCandidate.applicant)?.email}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(drawerCandidate.status)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDrawerCandidate(null)}
                      className="p-2 rounded-xl bg-elevated text-foreground/60 hover:text-foreground transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="p-4 rounded-xl bg-elevated border border-border space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-foreground/70">
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} className="text-foreground/40" /> Email:
                      </span>
                      <a
                        href={`mailto:${(drawerCandidate.appliedBy || drawerCandidate.applicant)?.email}`}
                        className="text-silver hover:underline"
                      >
                        {(drawerCandidate.appliedBy || drawerCandidate.applicant)?.email}
                      </a>
                    </div>
                    {((drawerCandidate.appliedBy || drawerCandidate.applicant)?.phone) && (
                      <div className="flex items-center justify-between text-foreground/70">
                        <span className="flex items-center gap-1.5">
                          <Phone size={13} className="text-foreground/40" /> Phone:
                        </span>
                        <a
                          href={`tel:${(drawerCandidate.appliedBy || drawerCandidate.applicant)?.phone}`}
                          className="text-silver hover:underline"
                        >
                          {(drawerCandidate.appliedBy || drawerCandidate.applicant)?.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-foreground/70">
                      <span>Applied On:</span>
                      <span className="text-foreground">
                        {new Date(drawerCandidate.createdAt || drawerCandidate.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Candidate Skills */}
                  {(drawerCandidate.appliedBy || drawerCandidate.applicant)?.skills?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/60 mb-2">
                        Skills & Competencies
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(drawerCandidate.appliedBy || drawerCandidate.applicant).skills.map(
                          (skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-elevated border border-border text-xs font-mono text-foreground"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Candidate Pitch */}
                  {drawerCandidate.applicantMessage && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <h4 className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <MessageSquareQuote size={14} /> Candidate Pitch
                      </h4>
                      <p className="text-xs font-sans text-amber-100/90 whitespace-pre-wrap leading-relaxed">
                        "{drawerCandidate.applicantMessage}"
                      </p>
                    </div>
                  )}

                  {/* Screening Questions */}
                  {drawerCandidate.screeningAnswers && drawerCandidate.screeningAnswers.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare size={14} /> Screening Question Responses
                      </h4>
                      <div className="space-y-2">
                        {drawerCandidate.screeningAnswers.map((qa, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-elevated border border-border text-xs"
                          >
                            <p className="font-semibold text-foreground mb-1">
                              Q: {qa.question}
                            </p>
                            <p className="font-mono text-foreground/70 whitespace-pre-wrap bg-surface p-2 rounded-lg border border-border">
                              A: {qa.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reschedule Request if present */}
                  {drawerCandidate.rescheduleRequest?.isRequested && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 uppercase">
                          Reschedule Request
                        </span>
                        <span className="text-[10px] text-amber-400">
                          Status: {drawerCandidate.rescheduleRequest.requestStatus}
                        </span>
                      </div>
                      <p className="text-amber-100/80">
                        Reason: {drawerCandidate.rescheduleRequest.reason}
                      </p>
                      <p className="text-amber-100/80">
                        Proposed: {drawerCandidate.rescheduleRequest.proposedTime}
                      </p>
                    </div>
                  )}
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-6 border-t border-border space-y-3 mt-6">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        triggerSingleStatus(
                          drawerCandidate,
                          "shortlisted",
                          "Shortlist Candidate",
                          true
                        );
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 text-xs font-mono uppercase tracking-wider font-bold transition-colors"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => {
                        triggerSingleStatus(
                          drawerCandidate,
                          "Interview Scheduled",
                          "Schedule Interview",
                          true
                        );
                      }}
                      className="px-3 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-mono uppercase tracking-wider font-bold transition-colors"
                    >
                      Interview
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const cand = drawerCandidate.appliedBy || drawerCandidate.applicant;
                      navigate(`/profile/${cand._id}`, {
                        state: {
                          applicationId: drawerCandidate._id,
                          status: drawerCandidate.status,
                          applicantList: masterCandidateIdList,
                        },
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors flex items-center justify-center gap-1.5"
                  >
                    Open Full Profile Dossier <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* PITCH MODAL                                                               */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {pitchModal.show && (
            <div
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setPitchModal({ show: false, message: "", name: "" })}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl relative"
              >
                <button
                  onClick={() => setPitchModal({ show: false, message: "", name: "" })}
                  className="absolute top-4 right-4 text-foreground/40 hover:text-foreground"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2 mb-4 text-amber-400">
                  <MessageSquareQuote size={22} />
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Pitch from {pitchModal.name}
                  </h3>
                </div>
                <div className="p-4 bg-elevated border border-border rounded-xl">
                  <p className="text-foreground/90 leading-relaxed font-sans text-xs whitespace-pre-wrap">
                    "{pitchModal.message}"
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* ASSESSMENT / SCREENING ANSWERS MODAL                                      */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {assessmentModal.show && (
            <div
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setAssessmentModal({ show: false, answers: [], name: "" })}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface border border-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto"
              >
                <button
                  onClick={() => setAssessmentModal({ show: false, answers: [], name: "" })}
                  className="absolute top-4 right-4 text-foreground/40 hover:text-foreground"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2 mb-6 text-blue-400">
                  <CheckSquare size={22} />
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Assessment: {assessmentModal.name}
                  </h3>
                </div>
                <div className="space-y-3">
                  {assessmentModal.answers.map((qa, index) => (
                    <div
                      key={index}
                      className="p-4 bg-elevated border border-border rounded-xl space-y-1.5"
                    >
                      <p className="font-bold text-foreground text-xs">Q: {qa.question}</p>
                      <p className="text-foreground/80 font-mono text-xs whitespace-pre-wrap bg-surface p-2.5 rounded-lg border border-border">
                        A: {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* ACTION / RESCHEDULE / STATUS UPDATE MODAL                                  */}
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
                  Target Stage:{" "}
                  <span className="text-silver uppercase">{actionModal.status}</span>
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
                        Response Message to Candidate
                      </label>
                      <textarea
                        value={employerMessage}
                        onChange={(e) => setEmployerMessage(e.target.value)}
                        placeholder="Provide details about whether this time works or offer an alternative..."
                        className="w-full p-3 bg-elevated border border-border rounded-xl text-xs font-sans text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver h-24 resize-y"
                      />
                    </div>
                  </div>
                ) : actionModal.requireMessage ? (
                  <div className="mb-6 space-y-3">
                    {actionModal.status === "Interview Scheduled" && (
                      <div>
                        <label className="block text-xs font-mono text-foreground/70 mb-1.5 uppercase">
                          Meeting Link (Google Meet, Zoom, etc.)
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
                        Message (Emailed to {selectedApps.length} candidate{selectedApps.length > 1 ? "s" : ""})
                      </label>
                      <textarea
                        value={employerMessage}
                        onChange={(e) => setEmployerMessage(e.target.value)}
                        placeholder="Include interview timings, instructions, or role next steps..."
                        className="w-full p-3 bg-elevated border border-border rounded-xl text-xs font-sans text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver h-28 resize-y"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-sans text-foreground/70 mb-6">
                    Are you sure you want to transition{" "}
                    <strong className="text-foreground">{selectedApps.length} candidate(s)</strong> to{" "}
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
                      onClick={handleBulkStatusUpdate}
                      disabled={
                        actionLoading ||
                        (actionModal.requireMessage && !employerMessage.trim())
                      }
                      className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-background bg-foreground hover:bg-silver transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                    >
                      {actionLoading ? (
                        <Loader2 className="animate-spin" size={13} />
                      ) : (
                        <CheckSquare size={14} />
                      )}{" "}
                      Confirm Update
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </EmployerLayout>
  );
}
