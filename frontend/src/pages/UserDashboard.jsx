import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Briefcase,
  Calendar,
  Bookmark,
  Award,
  Sparkles,
  ArrowRight,
  Send,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Plus,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  XCircle,
  Check,
  ChevronDown,
  UserCheck,
  Search,
  Zap,
  TrendingUp,
  FolderArchive,
  Compass,
  FileCode,
} from "lucide-react";
import CandidateLayout from "../components/candidate/CandidateLayout";
import JobDetailsModal from "../components/JobDetailsModal";
import ApplicationDetailsModal from "../components/ApplicationDetailsModal";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../routes/Context";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // --- COMPONENT STATES ---
  const [_loadingProfile, setLoadingProfile] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [fallbackJobs, setFallbackJobs] = useState([]);
  const [lastRecommendTime, setLastRecommendTime] = useState(null);

  // Modal interactions
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [selectedApplicationForModal, setSelectedApplicationForModal] = useState(null);

  // Saved Jobs State
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const stored = localStorage.getItem("jobone_saved_jobs");
      return stored ? JSON.parse(stored) : [];
    } catch (_err) {
      return [];
    }
  });

  // Dashboard Customization Preferences
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem("jobone_candidate_dashboard_preferences");
      if (stored) return JSON.parse(stored);
    } catch (_err) {
      /* ignore */
    }
    return {
      showRecommendations: true,
      showPipeline: true,
      showChecklist: true,
      showInterviewWidget: true,
    };
  });

  const togglePreference = (key) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(
          "jobone_candidate_dashboard_preferences",
          JSON.stringify(updated)
        );
      } catch (_err) {
        /* ignore */
      }
      return updated;
    });
  };

  const resetPreferences = () => {
    const defaults = {
      showRecommendations: true,
      showPipeline: true,
      showChecklist: true,
      showInterviewWidget: true,
    };
    setPreferences(defaults);
    try {
      localStorage.setItem(
        "jobone_candidate_dashboard_preferences",
        JSON.stringify(defaults)
      );
    } catch (_err) {
      /* ignore */
    }
  };

  // Helper to extract clean userId
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

  const activeAuthToken = useMemo(() => {
    if (token) return token;
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo"));
      return stored?.token || localStorage.getItem("userToken");
    } catch {
      return null;
    }
  }, [token]);

  // --- 1. FETCH CANDIDATE PROFILE ---
  useEffect(() => {
    if (!resolvedUserId) {
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const headers = activeAuthToken ? { Authorization: `Bearer ${activeAuthToken}` } : {};
        const { data } = await axios.get(`${API_BASE_URL}/user/${resolvedUserId}`, { headers });
        setProfileData(data);
      } catch (err) {
        console.error("Failed to load candidate profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [resolvedUserId, activeAuthToken]);

  // --- 2. FETCH CANDIDATE APPLICATIONS ---
  useEffect(() => {
    if (!resolvedUserId || !activeAuthToken) {
      setLoadingApplications(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoadingApplications(true);
        const { data } = await axios.get(`${API_BASE_URL}/applications/${resolvedUserId}`, {
          headers: { Authorization: `Bearer ${activeAuthToken}` },
        });
        setApplications(data.applications || []);
      } catch (err) {
        console.error("Failed to load applications", err);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [resolvedUserId, activeAuthToken]);

  // --- 3. FETCH RECOMMENDATIONS & DISCOVERY JOBS ---
  const fetchRecommendations = useCallback(
    async (allJobsList = [], force = false) => {
      if (!activeAuthToken) return;

      if (!force) {
        try {
          const cachedJobs = localStorage.getItem("aiRecommendedJobsCache");
          const cachedTime = localStorage.getItem("aiRecommendedJobsTime");
          if (cachedJobs && cachedTime) {
            setRecommendedJobs(JSON.parse(cachedJobs));
            setLastRecommendTime(cachedTime);
            return;
          }
        } catch (_err) {
          /* ignore */
        }
      }

      setLoadingRecommendations(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/ai/recommend-jobs`, {
          headers: { Authorization: `Bearer ${activeAuthToken}` },
        });

        if (data && Array.isArray(data.recommendedJobs)) {
          const richRecommendations = data.recommendedJobs
            .map((aiJob) => {
              const fullJob = allJobsList.find((j) => j._id === aiJob.jobId);
              return {
                ...(fullJob || {}),
                matchScore: aiJob.matchScore || 90,
                reason: aiJob.reason || "Matches your profile skill matrix.",
                _id: aiJob.jobId,
                title: fullJob?.title || aiJob.title || "Software Specialist",
              };
            })
            .filter((j) => j.title);

          setRecommendedJobs(richRecommendations);
          const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastRecommendTime(nowStr);
          try {
            localStorage.setItem("aiRecommendedJobsCache", JSON.stringify(richRecommendations));
            localStorage.setItem("aiRecommendedJobsTime", nowStr);
          } catch (_err) {
            /* ignore */
          }
        }
      } catch (err) {
        console.error("AI recommendations unavailable, falling back to featured jobs", err);
      } finally {
        setLoadingRecommendations(false);
      }
    },
    [activeAuthToken]
  );

  useEffect(() => {
    const fetchGeneralJobs = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/jobs?limit=15`);
        const jobs = data.data || data || [];
        setFallbackJobs(jobs);
        fetchRecommendations(jobs);
      } catch (err) {
        console.error("Failed to fetch jobs catalogue", err);
      }
    };

    fetchGeneralJobs();
  }, [fetchRecommendations]);

  // --- 4. PROFILE COMPLETENESS CALCULATION (Real Metrics) ---
  const { profileStrength, strengthTier, missingChecklist } = useMemo(() => {
    let score = 0;
    const missing = [];

    const name = profileData?.name || user?.name;
    const email = profileData?.email || user?.email;
    const phone = profileData?.phone || profileData?.phoneNumber;
    const headline = profileData?.description || profileData?.headline;

    let skillsList = [];
    if (Array.isArray(profileData?.skills)) skillsList = profileData.skills;
    else if (typeof profileData?.skills === "string") {
      try {
        skillsList = JSON.parse(profileData.skills);
      } catch {
        skillsList = profileData.skills.split(",").filter(Boolean);
      }
    }

    let experienceList = [];
    if (Array.isArray(profileData?.experience)) experienceList = profileData.experience;
    else if (typeof profileData?.experience === "string") {
      try {
        experienceList = JSON.parse(profileData.experience);
      } catch (_err) {
        /* ignore */
      }
    }

    let educationList = [];
    if (Array.isArray(profileData?.education)) educationList = profileData.education;
    else if (typeof profileData?.education === "string") {
      try {
        educationList = JSON.parse(profileData.education);
      } catch (_err) {
        /* ignore */
      }
    }

    const hasResume = !!(profileData?.resume || profileData?.resumeFileKey || profileData?.resumeData);

    // Basic Contact info (20%)
    if (name && email && phone) {
      score += 20;
    } else {
      missing.push({
        id: "contact",
        label: "Contact Information",
        description: "Add your full name, verified email, and phone number",
        path: "/editprofile",
      });
    }

    // Headline / Bio (15%)
    if (headline && headline.length > 20) {
      score += 15;
    } else {
      missing.push({
        id: "headline",
        label: "Professional Bio / Headline",
        description: "Introduce your target role and expertise to hiring managers",
        path: "/editprofile",
      });
    }

    // Skills Matrix (20%)
    if (skillsList.length >= 3) {
      score += 20;
    } else {
      missing.push({
        id: "skills",
        label: "Core Skills (Min 3)",
        description: `Add ${Math.max(1, 3 - skillsList.length)} more skill tags to improve AI matching`,
        path: "/editprofile",
      });
    }

    // Career History or Education (20%)
    if (experienceList.length > 0 || educationList.length > 0) {
      score += 20;
    } else {
      missing.push({
        id: "history",
        label: "Experience or Education",
        description: "List at least one past job or university degree",
        path: "/editprofile",
      });
    }

    // Verified Resume / Documents (25%)
    if (hasResume) {
      score += 25;
    } else {
      missing.push({
        id: "resume",
        label: "Resume & Documents",
        description: "Build an ATS resume or upload official documents",
        path: "/candidate/resume-builder",
      });
    }

    const tier =
      score >= 85
        ? "All-Star Profile"
        : score >= 60
        ? "Advanced Profile"
        : score >= 40
        ? "Intermediate Profile"
        : "Needs Attention";

    return { profileStrength: score, strengthTier: tier, missingChecklist: missing };
  }, [profileData, user]);

  // --- 5. APPLICATION PIPELINE BREAKDOWN ---
  const { interviewApplications, activeApplicationsCount, shortlistedCount } = useMemo(() => {
    const interviews = applications.filter((app) => {
      const s = (app.status || "").toLowerCase();
      return s.includes("interview") || s === "interview scheduled";
    });

    const active = applications.filter((app) => {
      const s = (app.status || "").toLowerCase();
      return s !== "nctt" && s !== "rejected";
    });

    const shortlisted = applications.filter((app) => {
      const s = (app.status || "").toLowerCase();
      return s === "shortlisted";
    });

    return {
      interviewApplications: interviews,
      activeApplicationsCount: active.length,
      shortlistedCount: shortlisted.length,
    };
  }, [applications]);

  // --- 6. BOOKMARK TOGGLE HANDLER ---
  const toggleBookmark = (e, jobId) => {
    e.stopPropagation();
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem("jobone_saved_jobs", JSON.stringify(next));
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error("Failed to save bookmark", err);
      }
      return next;
    });
  };

  // Status Badge formatter
  const renderStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("interview")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-xs">
          <Calendar size={13} /> Interview
        </span>
      );
    }
    if (s === "hired") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xs">
          <CheckCircle2 size={13} /> Hired
        </span>
      );
    }
    if (s === "shortlisted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-silver/20 text-foreground border border-silver/40 shadow-xs">
          <Award size={13} /> Shortlisted
        </span>
      );
    }
    if (s === "nctt" || s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/30 shadow-xs">
          <XCircle size={13} /> Not Selected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-surface-elevated text-muted-foreground border border-border shadow-xs">
        <Clock size={13} /> Under Review
      </span>
    );
  };

  // Time-aware Greeting
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const candidateDisplayName =
    profileData?.name || user?.name || user?.user?.name || "Candidate";

  return (
    <CandidateLayout
      activeTab="dashboard"
      title="Candidate Command Center"
      onOpenJobDetails={setSelectedJobForModal}
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* ======================================================== */}
        {/* SECTION A: WELCOME HERO (PREMIUM COMMAND CENTER)         */}
        {/* ======================================================== */}
        <section aria-label="Candidate Welcome Command Hero">
          <div className="relative rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-surface-elevated p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden">
            {/* Subtle ambient lighting accent */}
            <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-silver/5 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Left Column: Greeting, Role Status & Quick Actions */}
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-surface-elevated text-silver border border-border">
                    <ShieldCheck size={14} className="text-silver" /> Active Candidate Workspace
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    • Live Recruitment Sync
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                    {greetingText},{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-silver">
                      {candidateDisplayName}
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                    {profileData?.description
                      ? profileData.description.length > 150
                        ? profileData.description.slice(0, 150) + "..."
                        : profileData.description
                      : "Monitor your job applications, scheduled employer interviews, and AI-curated opportunities in one unified command center."}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Search size={16} />
                    <span>Explore Open Roles</span>
                  </Link>

                  <Link
                    to="/myapplications"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground hover:bg-surface-hover font-semibold text-xs sm:text-sm transition-colors"
                  >
                    <Briefcase size={16} className="text-silver" />
                    <span>Track Applications ({applications.length})</span>
                  </Link>

                  <Link
                    to="/candidate/resume-builder"
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground hover:bg-surface-hover font-semibold text-xs sm:text-sm transition-colors"
                    title="Launch ATS Resume Builder"
                  >
                    <Sparkles size={16} className="text-silver" />
                    <span className="hidden sm:inline">ATS Resume</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-silver/20 text-foreground font-bold">
                      PRO
                    </span>
                  </Link>

                  <Link
                    to="/jobseeker-documents"
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground hover:bg-surface-hover font-semibold text-xs sm:text-sm transition-colors"
                  >
                    <FileText size={16} className="text-silver" />
                    <span>Documents</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Profile Strength Card */}
              <div className="w-full lg:w-96 shrink-0 p-6 rounded-2xl bg-surface border border-border shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    Profile Strength
                  </span>
                  <span className="text-xs font-mono font-bold text-silver px-2.5 py-0.5 rounded-md bg-surface-elevated border border-border">
                    {strengthTier}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-mono">
                      {profileStrength}%
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {profileStrength === 100
                        ? "Recruiter Ready"
                        : `${100 - profileStrength}% to Complete`}
                    </span>
                  </div>

                  {/* Silver Progress Track */}
                  <div className="w-full h-2.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-silver/70 via-silver to-foreground transition-all duration-700 ease-out rounded-full shadow-xs"
                      style={{ width: `${Math.max(6, profileStrength)}%` }}
                    />
                  </div>
                </div>

                {missingChecklist.length > 0 ? (
                  <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[210px]">
                      Next: <strong className="text-foreground">{missingChecklist[0].label}</strong>
                    </span>
                    <Link
                      to={missingChecklist[0].path}
                      className="font-bold text-silver hover:underline flex items-center gap-1 shrink-0"
                    >
                      Complete <ChevronRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="pt-2.5 border-t border-border flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 size={15} /> All profile credentials verified & active
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION B: UNIFIED KPI METRICS OVERVIEW (4 CARDS)        */}
        {/* ======================================================== */}
        <section aria-label="Candidate KPI Overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* KPI 1: Applied Jobs */}
            <div
              onClick={() => navigate("/myapplications")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/myapplications")}
              className="group p-5 sm:p-6 rounded-2xl border border-border bg-surface hover:bg-surface-elevated hover:border-silver/40 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-silver/40 flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Applications
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-silver group-hover:scale-105 transition-transform shadow-xs">
                    <Send size={18} />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground tracking-tight mb-1.5">
                  {loadingApplications ? (
                    <div className="w-14 h-9 bg-border/60 animate-pulse rounded" />
                  ) : (
                    applications.length
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
                <span className="truncate">{activeApplicationsCount} Active submissions</span>
                <ChevronRight size={15} className="text-silver group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </div>

            {/* KPI 2: Interview Schedules */}
            <div
              onClick={() => navigate("/myapplications")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/myapplications")}
              className="group p-5 sm:p-6 rounded-2xl border border-border bg-surface hover:bg-surface-elevated hover:border-silver/40 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-silver/40 flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Interviews
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shadow-xs">
                    <Calendar size={18} />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground tracking-tight mb-1.5">
                  {loadingApplications ? (
                    <div className="w-14 h-9 bg-border/60 animate-pulse rounded" />
                  ) : (
                    interviewApplications.length
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
                <span className="truncate">
                  {interviewApplications.length > 0
                    ? `${interviewApplications.length} Pending call${interviewApplications.length > 1 ? "s" : ""}`
                    : "No pending rounds today"}
                </span>
                <ChevronRight size={15} className="text-purple-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </div>

            {/* KPI 3: Saved Vault */}
            <div
              onClick={() => {
                window.dispatchEvent(new Event("jobone_open_saved_jobs"));
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.dispatchEvent(new Event("jobone_open_saved_jobs"));
                }
              }}
              className="group p-5 sm:p-6 rounded-2xl border border-border bg-surface hover:bg-surface-elevated hover:border-silver/40 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-silver/40 flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Saved Vault
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-silver group-hover:scale-105 transition-transform shadow-xs">
                    <Bookmark size={18} />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground tracking-tight mb-1.5">
                  {savedJobIds.length}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
                <span className="truncate">Bookmarked opportunities</span>
                <ChevronRight size={15} className="text-silver group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </div>

            {/* KPI 4: Profile Status & Shortlists */}
            <div
              onClick={() => navigate("/profile")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/profile")}
              className="group p-5 sm:p-6 rounded-2xl border border-border bg-surface hover:bg-surface-elevated hover:border-silver/40 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-silver/40 flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Profile Standing
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-silver group-hover:scale-105 transition-transform shadow-xs">
                    <Award size={18} />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground tracking-tight mb-1.5">
                  {shortlistedCount > 0 ? `${shortlistedCount} Shortlists` : `${profileStrength}%`}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
                <span className="truncate">
                  {shortlistedCount > 0 ? "Direct employer shortlists" : strengthTier}
                </span>
                <ChevronRight size={15} className="text-silver group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION C: CAREER ACTIVITY WORKSPACE (MAIN + SIDEBAR)    */}
        {/* ======================================================== */}
        <div className="space-y-4">
          {/* Section Toolbar: Title & Customization Dropdown */}
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Career Activity Workspace
              </h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Inbound recruitment feedback, applications velocity, and tailored openings
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCustomizing((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-surface text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors shadow-xs"
              >
                <SlidersHorizontal size={14} className="text-silver" />
                <span>Customize View</span>
                <ChevronDown
                  size={14}
                  className={isCustomizing ? "rotate-180 transition-transform" : "transition-transform"}
                />
              </button>

              {isCustomizing && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-surface border border-border shadow-2xl p-4 z-30 space-y-3.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-bold text-foreground">Dashboard Widgets</span>
                    <button
                      onClick={resetPreferences}
                      className="text-[11px] text-silver hover:underline font-mono"
                    >
                      Reset Defaults
                    </button>
                  </div>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-muted-foreground">Applications Pipeline</span>
                    <input
                      type="checkbox"
                      checked={preferences.showPipeline}
                      onChange={() => togglePreference("showPipeline")}
                      className="rounded border-border accent-foreground"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-muted-foreground">AI Job Recommendations</span>
                    <input
                      type="checkbox"
                      checked={preferences.showRecommendations}
                      onChange={() => togglePreference("showRecommendations")}
                      className="rounded border-border accent-foreground"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-muted-foreground">Interviews Widget</span>
                    <input
                      type="checkbox"
                      checked={preferences.showInterviewWidget}
                      onChange={() => togglePreference("showInterviewWidget")}
                      className="rounded border-border accent-foreground"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-muted-foreground">Readiness Checklist</span>
                    <input
                      type="checkbox"
                      checked={preferences.showChecklist}
                      onChange={() => togglePreference("showChecklist")}
                      className="rounded border-border accent-foreground"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Grid Layout: 8 Cols Main Content + 4 Cols Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* ---------------------------------------------------- */}
            {/* LEFT 8 COLS: APPLICATIONS & RECOMMENDATIONS          */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-8 space-y-8">
              {/* 1. RECENT APPLICATIONS */}
              {preferences.showPipeline && (
                <section aria-labelledby="applications-pipeline-title" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-silver">
                        <Send size={16} />
                      </div>
                      <div>
                        <h3
                          id="applications-pipeline-title"
                          className="text-base sm:text-lg font-bold tracking-tight text-foreground"
                        >
                          Recent Applications
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Direct updates from employer applicant tracking workflows
                        </p>
                      </div>
                    </div>

                    {applications.length > 0 && (
                      <Link
                        to="/myapplications"
                        className="text-xs font-semibold text-silver hover:underline flex items-center gap-1"
                      >
                        <span>View All ({applications.length})</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>

                  {loadingApplications ? (
                    <div className="space-y-3.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-24 rounded-2xl bg-surface border border-border animate-pulse p-5"
                        />
                      ))}
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-border bg-surface/50 text-center space-y-3.5">
                      <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground mx-auto">
                        <Briefcase size={22} className="text-silver/80" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-foreground">No Applications Yet</h4>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                          You have not submitted any applications so far. Browse curated roles below to begin your candidate journey.
                        </p>
                      </div>
                      <Link
                        to="/jobs"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        <span>Browse Open Positions</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.slice(0, 5).map((app) => {
                        const company = app.companyName || app.job?.postedByCompany || "Verified Employer";
                        const title = app.jobTitle || app.job?.title || "Role Application";
                        const dateStr = app.createdAt || app.appliedAt;
                        const formattedDate = dateStr
                          ? new Date(dateStr).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recent";

                        return (
                          <div
                            key={app._id}
                            onClick={() => setSelectedApplicationForModal(app)}
                            className="group p-4 sm:p-5 rounded-2xl border border-border bg-surface hover:bg-surface-elevated hover:border-silver/40 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-4 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-silver font-bold text-sm uppercase font-mono shrink-0 shadow-xs">
                                {company[0] || "J"}
                              </div>
                              <div className="min-w-0 space-y-1">
                                <h4 className="font-bold text-sm sm:text-base text-foreground tracking-tight group-hover:text-silver transition-colors truncate">
                                  {title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1.5 truncate">
                                    <Building2 size={13} className="text-silver" /> {company}
                                  </span>
                                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                                    <Clock size={12} className="text-silver" /> Applied {formattedDate}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                              {renderStatusBadge(app.status)}
                              <ChevronRight
                                size={18}
                                className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* 2. RECOMMENDED & CURATED OPPORTUNITIES */}
              {preferences.showRecommendations && (
                <section aria-labelledby="recommendations-title" className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-silver">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            id="recommendations-title"
                            className="text-base sm:text-lg font-bold tracking-tight text-foreground"
                          >
                            Recommended For You
                          </h3>
                          {recommendedJobs.length > 0 && (
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-silver/10 text-silver border border-silver/20">
                              AI Curated
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Opportunities matched to your skills matrix, experience, and profile tags
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {lastRecommendTime && (
                        <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
                          Synced {lastRecommendTime}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => fetchRecommendations(fallbackJobs, true)}
                        disabled={loadingRecommendations}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-semibold text-foreground hover:bg-surface-elevated transition-colors disabled:opacity-50 shadow-xs"
                        title="Refresh AI matches"
                      >
                        <RefreshCw
                          size={13}
                          className={loadingRecommendations ? "animate-spin text-silver" : ""}
                        />
                        <span>Refresh</span>
                      </button>
                      <Link
                        to="/recommended-jobs"
                        className="text-xs font-semibold text-silver hover:underline flex items-center gap-1 ml-2"
                      >
                        <span>View All</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* Job Cards Grid */}
                  {loadingRecommendations ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-56 rounded-2xl bg-surface border border-border animate-pulse p-5 space-y-4"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {(recommendedJobs.length > 0 ? recommendedJobs.slice(0, 4) : fallbackJobs.slice(0, 4)).map(
                        (job) => {
                          const companyName = job.postedByCompany || job.postedByName || "Verified Employer";
                          const locationStr =
                            typeof job.location === "object"
                              ? job.location?.address || "Remote"
                              : job.location || "Remote";
                          const isSaved = savedJobIds.includes(job._id);
                          const salaryStr = job.salary
                            ? `₹${Number(job.salary).toLocaleString()}`
                            : "Competitive Salary";

                          return (
                            <div
                              key={job._id}
                              onClick={() => setSelectedJobForModal(job)}
                              className="group relative p-5 sm:p-6 rounded-2xl border border-border bg-surface hover:bg-surface-elevated hover:border-silver/40 transition-all cursor-pointer shadow-sm flex flex-col justify-between space-y-4"
                            >
                              <div className="space-y-3">
                                {/* Top Bar: Company Identity & Bookmark */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-xs font-bold text-silver font-mono shrink-0 shadow-xs">
                                      {companyName[0] || "C"}
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate font-semibold">
                                      {companyName}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => toggleBookmark(e, job._id)}
                                    className={`p-2 rounded-xl border transition-colors ${
                                      isSaved
                                        ? "bg-silver/20 border-silver/40 text-silver"
                                        : "border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                                    }`}
                                    title={isSaved ? "Saved in vault" : "Save opportunity"}
                                    aria-label={isSaved ? "Remove from saved" : "Save job"}
                                  >
                                    <Bookmark size={15} className={isSaved ? "fill-silver" : ""} />
                                  </button>
                                </div>

                                {/* Title */}
                                <h4 className="font-bold text-base sm:text-lg text-foreground tracking-tight group-hover:text-silver transition-colors line-clamp-1">
                                  {job.title}
                                </h4>

                                {/* Match Insight Badge */}
                                {job.reason && (
                                  <div className="text-xs text-muted-foreground line-clamp-2 bg-surface-elevated p-2.5 rounded-xl border border-border/70 leading-relaxed">
                                    <span className="font-semibold text-silver">Match insight:</span>{" "}
                                    {job.reason}
                                  </div>
                                )}
                              </div>

                              {/* Metadata & Actions Footer */}
                              <div className="pt-3 border-t border-border/70 space-y-3.5">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1 truncate font-mono text-[11px]">
                                    <MapPin size={12} className="text-silver shrink-0" /> {locationStr}
                                  </span>
                                  <span className="font-bold text-foreground font-mono">
                                    {salaryStr}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1">
                                  <span className="text-silver font-semibold group-hover:underline flex items-center gap-1">
                                    Inspect Requisition <ArrowRight size={13} />
                                  </span>
                                  <Link
                                    to={`/apply/${job._id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-3.5 py-1.5 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition-opacity shadow-xs"
                                  >
                                    Apply Now
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* RIGHT 4 COLS: INTERVIEW WIDGET, CHECKLIST & TOOLS    */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-6">
              {/* 1. UPCOMING INTERVIEWS WIDGET */}
              {preferences.showInterviewWidget && (
                <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Calendar size={16} />
                      </div>
                      <h3 className="font-bold text-sm tracking-tight text-foreground">
                        Interview Schedule
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-400 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                      {interviewApplications.length} Scheduled
                    </span>
                  </div>

                  {interviewApplications.length > 0 ? (
                    <div className="space-y-3">
                      {interviewApplications.map((app) => (
                        <div
                          key={app._id}
                          onClick={() => setSelectedApplicationForModal(app)}
                          className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-pointer space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground truncate max-w-[180px]">
                              {app.jobTitle || "Interview Round"}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {app.companyName || "Employer Round"}
                          </p>
                          <p className="text-[11px] font-mono text-silver pt-1">
                            Click to view meeting instructions & link
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 rounded-xl border border-border bg-surface-elevated/40 text-center space-y-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        No active interview rounds scheduled today. As employers review your submissions, schedule notifications will appear here.
                      </p>
                      <Link
                        to="/jobs"
                        className="text-xs text-silver font-bold hover:underline inline-block pt-1"
                      >
                        Apply to more roles
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* 2. CAREER READINESS CHECKLIST */}
              {preferences.showChecklist && (
                <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-silver">
                        <UserCheck size={16} />
                      </div>
                      <h3 className="font-bold text-sm tracking-tight text-foreground">
                        Readiness Checklist
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-silver px-2 py-0.5 rounded-md bg-surface-elevated border border-border">
                      {5 - missingChecklist.length}/5 Done
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { id: "contact", label: "Contact Details", path: "/editprofile" },
                      { id: "headline", label: "Professional Bio", path: "/editprofile" },
                      { id: "skills", label: "Core Skill Tags (3+)", path: "/editprofile" },
                      { id: "history", label: "Experience / Education", path: "/editprofile" },
                      { id: "resume", label: "Resume & Documents", path: "/candidate/resume-builder" },
                    ].map((item) => {
                      const isMissing = missingChecklist.some((m) => m.id === item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-surface-elevated/40 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                                !isMissing
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-border text-muted-foreground"
                              }`}
                            >
                              {!isMissing ? <Check size={12} /> : "—"}
                            </div>
                            <span
                              className={`truncate ${
                                !isMissing ? "text-foreground font-semibold" : "text-muted-foreground"
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                          {isMissing && (
                            <Link
                              to={item.path}
                              className="text-xs font-bold text-silver hover:underline shrink-0"
                            >
                              Add +
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. RECRUITMENT TOOLKIT & QUICK VAULT */}
              <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface space-y-3.5 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-silver">
                    <FolderArchive size={16} />
                  </div>
                  <h3 className="font-bold text-sm tracking-tight text-foreground">
                    Career Tools & Vault
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <Link
                    to="/candidate/resume-builder"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-elevated hover:bg-surface-hover transition-colors text-foreground group"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles size={16} className="text-silver group-hover:scale-105 transition-transform" />
                      <div className="space-y-0.5">
                        <span className="font-semibold block">ATS Resume Builder</span>
                        <span className="text-[11px] text-muted-foreground block">
                          5 Templates • Keyword Matcher
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-silver/20 text-foreground font-bold">
                      PRO
                    </span>
                  </Link>

                  <Link
                    to="/jobseeker-documents"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-elevated hover:bg-surface-hover transition-colors text-foreground group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-silver group-hover:scale-105 transition-transform" />
                      <span className="font-semibold">Documents & Marksheets</span>
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/companies"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-elevated hover:bg-surface-hover transition-colors text-foreground group"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 size={16} className="text-silver group-hover:scale-105 transition-transform" />
                      <span className="font-semibold">Explore Companies</span>
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/services"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-elevated hover:bg-surface-hover transition-colors text-foreground group"
                  >
                    <div className="flex items-center gap-3">
                      <Award size={16} className="text-silver group-hover:scale-105 transition-transform" />
                      <span className="font-semibold">Hiring Services & FAQs</span>
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODALS & POPUPS                                          */}
      {/* ======================================================== */}
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

      {selectedApplicationForModal && (
        <ApplicationDetailsModal
          application={selectedApplicationForModal}
          onClose={() => setSelectedApplicationForModal(null)}
        />
      )}
    </CandidateLayout>
  );
}
