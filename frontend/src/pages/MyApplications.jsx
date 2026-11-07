import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Clock,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Monitor,
  Building,
  Globe,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Award,
  Video,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3,
  CalendarCheck,
  Briefcase,
  Layers,
} from "lucide-react";
import CandidateLayout from "../components/candidate/CandidateLayout";
import ApplicationDetailsModal from "../components/ApplicationDetailsModal";
import JobDetailsModal from "../components/JobDetailsModal";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../routes/Context";

export default function MyApplications() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "review" | "interview" | "shortlisted" | "archived"

  // Employer Message Quick Modal
  const [activeMessagePopup, setActiveMessagePopup] = useState(null);

  // Resolve active candidate token & user ID
  const activeToken = useMemo(() => {
    if (token) return token;
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo"));
      return stored?.token || localStorage.getItem("userToken");
    } catch {
      return null;
    }
  }, [token]);

  const resolvedUserId = useMemo(() => {
    if (user?.userId || user?.id || user?.user?.id || user?.user?._id || user?._id) {
      return user.userId || user.id || user.user?.id || user.user?._id || user._id;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo"));
      return stored?.userId || stored?.id || stored?.user?.id || stored?.user?._id || stored?._id;
    } catch {
      return null;
    }
  }, [user]);

  // Fetch candidate applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!resolvedUserId || !activeToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/applications/${resolvedUserId}`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        setApplications(data.applications || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [resolvedUserId, activeToken]);

  // --- 1. CAREER ANALYTICS COMPUTATION ---
  const {
    totalCount,
    underReviewCount,
    interviewCount,
    shortlistedCount,
    archivedCount,
    responseRate,
    statusDistribution,
  } = useMemo(() => {
    const total = applications.length;
    let review = 0;
    let interview = 0;
    let shortlisted = 0;
    let archived = 0;
    let responded = 0;

    applications.forEach((app) => {
      const s = (app.status || "").toLowerCase();
      if (s.includes("interview")) {
        interview++;
        responded++;
      } else if (s === "shortlisted") {
        shortlisted++;
        responded++;
      } else if (s === "hired" || s === "nctt" || s === "rejected") {
        archived++;
        responded++;
      } else {
        review++;
      }
    });

    const rate = total > 0 ? Math.round((responded / total) * 100) : 0;

    const distribution = [
      { label: "Review", count: review, color: "bg-muted-foreground/40" },
      { label: "Shortlisted", count: shortlisted, color: "bg-silver" },
      { label: "Interview", count: interview, color: "bg-purple-400" },
      { label: "Offer / Closed", count: archived, color: "bg-emerald-400" },
    ];

    return {
      totalCount: total,
      underReviewCount: review,
      interviewCount: interview,
      shortlistedCount: shortlisted,
      archivedCount: archived,
      responseRate: rate,
      statusDistribution: distribution,
    };
  }, [applications]);

  // --- 2. FILTERED & SEARCHED APPLICATIONS ---
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const s = (app.status || "").toLowerCase();
      const job = app.job || {};
      const title = (app.jobTitle || job.title || "").toLowerCase();
      const company = (
        app.companyName ||
        job.postedByCompany ||
        job.postedByName ||
        job.postedBy?.name ||
        ""
      ).toLowerCase();

      // Tab filter
      if (activeTab === "review" && (s.includes("interview") || s === "shortlisted" || s === "hired" || s === "nctt")) {
        return false;
      }
      if (activeTab === "interview" && !s.includes("interview")) {
        return false;
      }
      if (activeTab === "shortlisted" && s !== "shortlisted") {
        return false;
      }
      if (activeTab === "archived" && s !== "hired" && s !== "nctt" && s !== "rejected") {
        return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return title.includes(query) || company.includes(query);
      }

      return true;
    });
  }, [applications, activeTab, searchQuery]);

  // Helper status badge renderer
  const renderStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("interview")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Calendar size={12} /> Interview Round
        </span>
      );
    }
    if (s === "hired") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={12} /> Hired / Offer
        </span>
      );
    }
    if (s === "shortlisted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-silver/20 text-foreground border border-silver/40">
          <Award size={12} /> Shortlisted
        </span>
      );
    }
    if (s === "assignment scheduled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <FileText size={12} /> Assessment
        </span>
      );
    }
    if (s === "nctt" || s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
          <XCircle size={12} /> Not Considered
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-elevated text-muted-foreground border border-border">
        <Clock size={12} /> In Review
      </span>
    );
  };

  return (
    <CandidateLayout
      activeTab="applications"
      title="My Applications"
      breadcrumbs={[{ label: "Career Activity", path: "/userdashboard" }]}
      onOpenJobDetails={setSelectedJobForModal}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans antialiased">
        {/* ======================================================== */}
        {/* 1. CAREER ANALYTICS & ACTIVITY HEADER                    */}
        {/* ======================================================== */}
        <section aria-label="Career Analytics Header" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-silver/10 text-silver border border-silver/20">
                  Application Tracking System
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                My Applications & Interviews
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Real-time tracking of candidate submissions, recruiter reviews, and scheduled employer interviews.
              </p>
            </div>

            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity shrink-0 shadow-sm self-start md:self-auto"
            >
              <Search size={14} /> Find More Jobs
            </Link>
          </div>

          {/* 4 Analytics KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Total Submissions
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight">
                {totalCount}
              </p>
              <p className="text-[11px] text-muted-foreground">Historical applications</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Active in Review
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight">
                {underReviewCount}
              </p>
              <p className="text-[11px] text-muted-foreground">Awaiting recruiter decisions</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
                  Interviews
                </span>
                {interviewCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                )}
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight">
                {interviewCount}
              </p>
              <p className="text-[11px] text-muted-foreground">Scheduled employer calls</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
              <span className="text-xs font-mono uppercase tracking-wider text-silver font-semibold">
                Employer Response Rate
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight">
                {responseRate}%
              </p>
              <p className="text-[11px] text-muted-foreground">{shortlistedCount} Shortlists confirmed</p>
            </div>
          </div>

          {/* Visual Status Distribution Bar */}
          {totalCount > 0 && (
            <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-border space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase text-muted-foreground font-semibold tracking-wider text-[11px]">
                  Pipeline Distribution
                </span>
                <span className="font-mono text-foreground font-bold text-[11px]">
                  {totalCount} Total Roles
                </span>
              </div>

              {/* Segmented Progress Track */}
              <div className="w-full h-2 rounded-full bg-border overflow-hidden flex gap-0.5">
                {statusDistribution.map(
                  (seg, i) =>
                    seg.count > 0 && (
                      <div
                        key={i}
                        className={`h-full ${seg.color} transition-all duration-500`}
                        style={{ width: `${(seg.count / totalCount) * 100}%` }}
                        title={`${seg.label}: ${seg.count}`}
                      />
                    )
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground font-mono pt-1">
                {statusDistribution.map(
                  (seg, i) =>
                    seg.count > 0 && (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${seg.color}`} />
                        {seg.label} ({seg.count})
                      </span>
                    )
                )}
              </div>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* 2. SEARCH & FILTER TABS                                  */}
        {/* ======================================================== */}
        <section aria-label="Search and Filter Controls" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All", count: totalCount },
                { id: "review", label: "In Review", count: underReviewCount },
                { id: "interview", label: "Interviews", count: interviewCount, highlight: true },
                { id: "shortlisted", label: "Shortlisted", count: shortlistedCount },
                { id: "archived", label: "Offers / Closed", count: archivedCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-surface-elevated hover:bg-surface-hover border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.id
                        ? "bg-background/20 text-background"
                        : tab.highlight && tab.count > 0
                        ? "bg-purple-500/20 text-purple-400 font-bold"
                        : "bg-border text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title or company..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border focus:border-silver focus:ring-1 focus:ring-silver/40 text-foreground placeholder:text-muted-foreground text-xs outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. APPLICATION CARDS FEED                                */}
        {/* ======================================================== */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-surface border border-border animate-pulse p-6 space-y-4"
              />
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-border bg-surface text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground mx-auto">
              <Briefcase size={24} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-foreground">
                {searchQuery ? "No Applications Match Search" : "No Applications Found in this Category"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchQuery
                  ? "Try adjusting your search terms or clearing the filter to see more applications."
                  : "You do not have any applications matching this status. Explore verified openings to submit new candidacies."}
              </p>
            </div>
            <div className="pt-2">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-xl border border-border bg-surface-elevated text-xs font-semibold text-foreground hover:bg-surface-hover transition-colors"
                >
                  Clear Search Filter
                </button>
              ) : (
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Browse Open Positions <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredApplications.map((app) => {
              const job = app.job || {};
              const company =
                app.companyName ||
                job.postedByCompany ||
                job.postedByName ||
                job.postedBy?.name ||
                "Verified Employer";
              const title = app.jobTitle || job.title || "Job Application";
              const locationStr =
                typeof job.location === "object"
                  ? job.location?.address || "Remote"
                  : job.location || "Remote";
              const dateStr = app.appliedAt || app.createdAt;
              const formattedDate = dateStr
                ? new Date(dateStr).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent";

              const salaryStr = job.salary
                ? `₹${Number(job.salary).toLocaleString()}`
                : "Compensation on Request";

              const hasEmployerMessage = !!app.employerMessage;
              const hasMeetingLink = !!app.meetingLink && (app.status || "").toLowerCase().includes("interview");
              const isReschedulePending =
                app.rescheduleRequest?.isRequested &&
                app.rescheduleRequest?.requestStatus === "pending";

              return (
                <div
                  key={app.applicationId || app._id}
                  onClick={() => setSelectedApplication(app)}
                  className="group p-5 sm:p-6 rounded-2xl border border-border bg-surface hover:bg-surface-elevated hover:border-silver/40 transition-all cursor-pointer shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Header: Company & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center font-bold text-sm font-mono text-silver shrink-0 uppercase">
                          {company[0] || "J"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground font-medium truncate flex items-center gap-1.5">
                            <Building2 size={12} className="text-silver shrink-0" />
                            <span className="truncate">{company}</span>
                          </p>
                          <h3 className="font-bold text-base text-foreground tracking-tight group-hover:text-silver transition-colors truncate">
                            {title}
                          </h3>
                        </div>
                      </div>

                      <div className="shrink-0">{renderStatusBadge(app.status)}</div>
                    </div>

                    {/* Prominent Employer Update Banner */}
                    {hasEmployerMessage && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMessagePopup({
                            status: app.status,
                            message: app.employerMessage,
                          });
                        }}
                        className="p-3 rounded-xl bg-silver/10 border border-silver/20 flex items-center justify-between gap-2 text-xs hover:bg-silver/15 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MessageCircle size={14} className="text-silver shrink-0" />
                          <span className="font-semibold text-foreground truncate">
                            Employer Message: "{app.employerMessage.slice(0, 50)}..."
                          </span>
                        </div>
                        <span className="font-mono text-silver text-[11px] shrink-0 font-bold">
                          View
                        </span>
                      </div>
                    )}

                    {/* Interview Meeting Link Banner */}
                    {hasMeetingLink && (
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Video size={14} className="text-purple-400 shrink-0" />
                          <span className="font-bold text-foreground">
                            Interview Video Room Ready
                          </span>
                        </div>
                        <a
                          href={app.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 rounded-lg bg-purple-500 text-white font-bold text-[11px] hover:bg-purple-600 transition-colors inline-flex items-center gap-1 shrink-0"
                        >
                          Join <ExternalLink size={10} />
                        </a>
                      </div>
                    )}

                    {/* Reschedule Pending Notice */}
                    {isReschedulePending && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono flex items-center gap-2">
                        <Clock size={12} className="shrink-0" />
                        <span>Reschedule Requested: Awaiting Employer Confirmation</span>
                      </div>
                    )}

                    {/* Metadata Strip */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-silver" /> {locationStr}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-foreground">{salaryStr}</span>
                      <span>•</span>
                      <span>{job.jobType || "Full-time"}</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono text-[11px]">
                      Applied {formattedDate}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApplication(app);
                      }}
                      className="font-bold text-silver hover:underline flex items-center gap-1"
                    >
                      Inspect Application <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. APPLICATION DETAILS MODAL (With Reschedule & Notes)   */}
      {/* ======================================================== */}
      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}

      {/* Quick Employer Message Modal */}
      {activeMessagePopup && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="fixed inset-0"
            onClick={() => setActiveMessagePopup(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg bg-surface text-foreground border border-border rounded-3xl p-6 sm:p-7 z-10 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-silver/10 border border-silver/20 flex items-center justify-center text-silver">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Message from Employer
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono uppercase">
                    Status: {activeMessagePopup.status}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMessagePopup(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-surface-elevated border border-border text-xs leading-relaxed text-foreground whitespace-pre-wrap">
              {activeMessagePopup.message}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveMessagePopup(null)}
                className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Close Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJobForModal && (
        <JobDetailsModal
          job={selectedJobForModal}
          onClose={() => setSelectedJobForModal(null)}
          onApply={() => {
            navigate(`/apply/${selectedJobForModal._id}`);
            setSelectedJobForModal(null);
          }}
        />
      )}
    </CandidateLayout>
  );
}
