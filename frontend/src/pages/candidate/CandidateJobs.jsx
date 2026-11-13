import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Filter,
  X,
  Building2,
  Bookmark,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  LayoutGrid,
  List,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import CandidateLayout from "../../components/candidate/CandidateLayout";
import CompanyDisplay from "../../components/CompanyDisplay";
import JobDetailsModal from "../../components/JobDetailsModal";
import { API_BASE_URL } from "../../config/api";
import { INDUSTRIES, normalizeIndustry } from "../../constants/taxonomy";
import { useAuth } from "../../routes/Context";

export default function CandidateJobs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Search & Filter State
  const initialQuery = queryParams.get("q") || queryParams.get("title") || "";
  const initialLocation = queryParams.get("location") || "";
  const initialIndustry = queryParams.get("industry") || "";

  const [keyword, setKeyword] = useState(initialQuery);
  const [locFilter, setLocFilter] = useState(initialLocation);
  const [selectedIndustry, setSelectedIndustry] = useState(initialIndustry);
  const [workMode, setWorkMode] = useState("all"); // "all" | "remote" | "hybrid" | "onsite"
  const [jobType, setJobType] = useState("all"); // "all" | "fulltime" | "parttime" | "internship" | "contract"
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "salary_high" | "title_asc"
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem("jobone_candidate_jobs_view") || "list";
    } catch {
      return "list";
    }
  });

  // Jobs, Applications, & UI States
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Saved Jobs State
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const stored = localStorage.getItem("jobone_saved_jobs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync with URL query parameters if they change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || params.get("title") || "";
    const loc = params.get("location") || "";
    const ind = params.get("industry") || "";
    if (q) setKeyword(q);
    if (loc) setLocFilter(loc);
    if (ind) setSelectedIndustry(ind);
  }, [location.search]);

  // Fetch Jobs from backend API
  useEffect(() => {
    const controller = new AbortController();

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_BASE_URL}/jobs`, {
          signal: controller.signal,
        });

        const rawData =
          res.data.data ||
          res.data.results ||
          (Array.isArray(res.data) ? res.data : []);

        const activeJobs = Array.isArray(rawData)
          ? rawData.filter(
              (j) =>
                j.status !== "inactive" &&
                j.status !== "closed" &&
                j.status !== "deadline passed"
            )
          : [];

        setJobs(activeJobs);
      } catch (err) {
        if (axios.isCancel(err) || err.name === "CanceledError" || err.name === "AbortError") {
          return;
        }
        console.error("Failed to load jobs:", err);
        setError("Unable to load jobs at this time. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    return () => controller.abort();
  }, []);

  // Fetch Candidate's existing applications for "Applied" status badges
  useEffect(() => {
    const resolvedUserId =
      user?.userId ||
      user?.id ||
      user?._id ||
      user?.user?.id ||
      user?.user?._id ||
      (() => {
        try {
          const stored = JSON.parse(localStorage.getItem("userInfo"));
          return stored?._id || stored?.id || stored?.user?._id || stored?.user?.id;
        } catch {
          return null;
        }
      })();

    const activeToken =
      token ||
      localStorage.getItem("userToken") ||
      (() => {
        try {
          const stored = JSON.parse(localStorage.getItem("userInfo"));
          return stored?.token;
        } catch {
          return null;
        }
      })();

    if (!resolvedUserId || !activeToken) return;

    const fetchApplications = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/applications/${resolvedUserId}`,
          {
            headers: { Authorization: `Bearer ${activeToken}` },
          }
        );
        const apps = data.applications || (Array.isArray(data) ? data : []);
        const idSet = new Set(
          apps.map((app) => app.jobId?._id || app.jobId || app.job?._id || app.job)
        );
        setAppliedJobIds(idSet);
      } catch (err) {
        // Non-blocking: If applications fail to load, proceed without applied badges
        console.warn("Could not fetch candidate applications for status badges:", err);
      }
    };

    fetchApplications();
  }, [user, token]);

  // Toggle Saved Bookmark
  const toggleBookmark = (e, jobId) => {
    if (e) e.stopPropagation();
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      try {
        localStorage.setItem("jobone_saved_jobs", JSON.stringify(next));
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error("Error updating saved jobs:", err);
      }
      return next;
    });
  };

  const handleToggleViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("jobone_candidate_jobs_view", mode);
    } catch (_e) {
      /* ignore */
    }
  };

  const handleResetFilters = () => {
    setKeyword("");
    setLocFilter("");
    setSelectedIndustry("");
    setWorkMode("all");
    setJobType("all");
    setSortBy("newest");
    navigate("/candidate/jobs", { replace: true });
  };

  // Helper safe converters
  const renderArray = (val) => {
    if (!val) return "Full-Time";
    if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "Full-Time";
    return String(val);
  };

  const isJobRemote = (job) => {
    const modeStr = (Array.isArray(job.mode) ? job.mode.join(" ") : String(job.mode || "")).toLowerCase();
    return modeStr.includes("remote") || modeStr.includes("home") || modeStr.includes("online");
  };

  const isJobHybrid = (job) => {
    const modeStr = (Array.isArray(job.mode) ? job.mode.join(" ") : String(job.mode || "")).toLowerCase();
    return modeStr.includes("hybrid");
  };

  // Filter and Sort Pipeline
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // 1. Keyword search (title, company, description, skills)
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      result = result.filter((j) => {
        const titleMatch = (j.title || "").toLowerCase().includes(q);
        const companyMatch = (
          j.postedByCompany ||
          j.postedByName ||
          j.hiringCompanyName ||
          ""
        )
          .toLowerCase()
          .includes(q);
        const descMatch = (j.description || "").toLowerCase().includes(q);
        const skillsMatch = Array.isArray(j.skills)
          ? j.skills.some((s) => String(s).toLowerCase().includes(q))
          : false;
        return titleMatch || companyMatch || descMatch || skillsMatch;
      });
    }

    // 2. Location filter
    if (locFilter.trim()) {
      const locQ = locFilter.toLowerCase().trim();
      result = result.filter((j) => {
        const locStr =
          typeof j.location === "object"
            ? (j.location?.address || "")
            : String(j.location || "");
        return locStr.toLowerCase().includes(locQ);
      });
    }

    // 3. Industry filter
    if (selectedIndustry) {
      result = result.filter((j) => {
        const rawInd = j.industry || j.category || "";
        const normJob = normalizeIndustry(rawInd);
        const normFilter = normalizeIndustry(selectedIndustry);
        return (
          normJob === normFilter ||
          rawInd.toLowerCase().includes(selectedIndustry.toLowerCase())
        );
      });
    }

    // 4. Work Mode filter
    if (workMode !== "all") {
      if (workMode === "remote") {
        result = result.filter(isJobRemote);
      } else if (workMode === "hybrid") {
        result = result.filter(isJobHybrid);
      } else if (workMode === "onsite") {
        result = result.filter((j) => !isJobRemote(j) && !isJobHybrid(j));
      }
    }

    // 5. Job Type filter
    if (jobType !== "all") {
      result = result.filter((j) => {
        const typeStr = (
          Array.isArray(j.jobType) ? j.jobType.join(" ") : String(j.jobType || "")
        ).toLowerCase();
        if (jobType === "fulltime") return typeStr.includes("full");
        if (jobType === "parttime") return typeStr.includes("part");
        if (jobType === "internship") return typeStr.includes("intern");
        if (jobType === "contract") return typeStr.includes("contract") || typeStr.includes("freelance");
        return true;
      });
    }

    // 6. Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === "salary_high") {
        const getSal = (j) => Number(j.stipend || j.salary || j.ctc || 0);
        return getSal(b) - getSal(a);
      }
      if (sortBy === "title_asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });

    return result;
  }, [jobs, keyword, locFilter, selectedIndustry, workMode, jobType, sortBy]);

  const activeFilterCount =
    (keyword ? 1 : 0) +
    (locFilter ? 1 : 0) +
    (selectedIndustry ? 1 : 0) +
    (workMode !== "all" ? 1 : 0) +
    (jobType !== "all" ? 1 : 0);

  return (
    <CandidateLayout
      activeTab="find-jobs"
      title="Find Jobs — Career Discovery"
      breadcrumbs={[{ label: "Find Jobs", path: "/candidate/jobs" }]}
      onOpenJobDetails={setSelectedJob}
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* ======================================================== */}
        {/* HERO SEARCH CONSOLE                                      */}
        {/* ======================================================== */}
        <div className="rounded-3xl border border-[var(--theme-border)] bg-gradient-to-br from-[var(--theme-surface)] via-[var(--theme-surface)] to-[var(--theme-surface-elevated)] p-6 sm:p-8 shadow-sm">
          <div className="max-w-4xl space-y-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[11px] font-mono text-[var(--theme-accent-silver)]">
              <Sparkles size={13} />
              <span>CANDIDATE DISCOVERY WORKSPACE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-[var(--theme-text)] tracking-tight">
              Explore Verified Career Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed">
              Search vetted job requisitions, apply directly from your candidate workspace, and track application workflows in real time.
            </p>
          </div>

          {/* Search Inputs Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-2 bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] rounded-2xl shadow-sm">
            <div className="md:col-span-5 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] pointer-events-none"
              />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skills, or enterprise name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs sm:text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] transition-all"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="md:col-span-4 relative">
              <MapPin
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] pointer-events-none"
              />
              <input
                type="text"
                value={locFilter}
                onChange={(e) => setLocFilter(e.target.value)}
                placeholder="City, state, or remote..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs sm:text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] transition-all"
              />
              {locFilter && (
                <button
                  type="button"
                  onClick={() => setLocFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileFilters((prev) => !prev)}
                className="md:hidden flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text)]"
              >
                <SlidersHorizontal size={14} />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset all filters"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-all cursor-pointer min-h-[40px]"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Pills Row (Desktop) */}
          <div className="hidden md:flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-[var(--theme-border)]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] mr-1">
              Sector:
            </span>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)] cursor-pointer"
            >
              <option value="">All 24 Taxonomy Sectors</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind.id} value={ind.name}>
                  {ind.name}
                </option>
              ))}
            </select>

            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] ml-2 mr-1">
              Work Mode:
            </span>
            <div className="flex items-center gap-1 rounded-xl bg-[var(--theme-surface-elevated)] p-1 border border-[var(--theme-border)]">
              {[
                { id: "all", label: "All" },
                { id: "remote", label: "Remote" },
                { id: "hybrid", label: "Hybrid" },
                { id: "onsite", label: "On-site" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setWorkMode(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    workMode === m.id
                      ? "bg-[var(--theme-surface)] text-[var(--theme-text)] font-semibold shadow-xs"
                      : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] ml-2 mr-1">
              Type:
            </span>
            <div className="flex items-center gap-1 rounded-xl bg-[var(--theme-surface-elevated)] p-1 border border-[var(--theme-border)]">
              {[
                { id: "all", label: "All" },
                { id: "fulltime", label: "Full-Time" },
                { id: "internship", label: "Internship" },
                { id: "contract", label: "Contract" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setJobType(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    jobType === t.id
                      ? "bg-[var(--theme-surface)] text-[var(--theme-text)] font-semibold shadow-xs"
                      : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filter Sheet / Accordion */}
        {showMobileFilters && (
          <div className="md:hidden p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--theme-border)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text)]">
                Filter Requisitions
              </span>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase block mb-1.5">
                Industry Sector
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)]"
              >
                <option value="">All Industry Sectors</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind.id} value={ind.name}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase block mb-1.5">
                Work Mode
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["all", "remote", "hybrid", "onsite"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setWorkMode(m)}
                    className={`py-1.5 rounded-lg text-xs capitalize ${
                      workMode === m
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-bold border border-[var(--theme-border-silver)]"
                        : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase block mb-1.5">
                Engagement Type
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "fulltime", label: "Full" },
                  { id: "internship", label: "Intern" },
                  { id: "contract", label: "Contract" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setJobType(t.id)}
                    className={`py-1.5 rounded-lg text-xs ${
                      jobType === t.id
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-bold border border-[var(--theme-border-silver)]"
                        : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text)]"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* RESULTS BAR: COUNT, SORT, & VIEW MODE                     */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text)] tracking-tight">
              {loading ? "Searching..." : `${filteredJobs.length} Requisitions Available`}
            </h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-accent-silver)]">
                {activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)]">
              <ArrowUpDown size={13} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-1.5 pl-2 pr-7 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)] cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="salary_high">Highest CTC</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-[var(--theme-surface)] p-1 border border-[var(--theme-border)]">
              <button
                type="button"
                onClick={() => handleToggleViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] shadow-xs"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                }`}
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleToggleViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] shadow-xs"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* LISTINGS / CARDS SECTION                                 */}
        {/* ======================================================== */}
        {loading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-elevated)]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-[var(--theme-surface-elevated)] rounded" />
                    <div className="h-3 w-1/4 bg-[var(--theme-surface-elevated)] rounded" />
                  </div>
                </div>
                <div className="h-3 w-3/4 bg-[var(--theme-surface-elevated)] rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-[var(--theme-surface-elevated)] rounded-full" />
                  <div className="h-6 w-20 bg-[var(--theme-surface-elevated)] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center text-sm font-mono space-y-3">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] text-xs font-semibold cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-12 text-center space-y-4 shadow-sm">
            <Briefcase size={44} className="mx-auto text-[var(--theme-text-muted)] opacity-50" />
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
                No matching opportunities found
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] max-w-md mx-auto">
                No active job requisitions match your current search criteria. Try modifying your keywords, location, or clearing industry filters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text)] transition-all cursor-pointer"
            >
              <RotateCcw size={14} /> Clear All Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
                : "space-y-3"
            }
          >
            {filteredJobs.map((job) => {
              const isApplied = appliedJobIds.has(job._id);
              const isSaved = savedJobIds.includes(job._id);
              const remote = isJobRemote(job);
              const hybrid = isJobHybrid(job);

              const companyName =
                job.postedByCompany ||
                job.postedByName ||
                job.hiringCompanyName ||
                "Verified Enterprise";

              const locationText = remote
                ? "Remote / Distributed"
                : hybrid
                ? "Hybrid Workspace"
                : typeof job.location === "object"
                ? job.location?.address || "On-site"
                : job.location || "On-site";

              const salaryText = job.stipend
                ? `₹${Number(job.stipend).toLocaleString("en-IN")}/mo`
                : job.salary
                ? `₹${Number(job.salary).toLocaleString("en-IN")}`
                : "Competitive / Disclosed in Interview";

              if (viewMode === "grid") {
                return (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJob(job)}
                    className="group rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] hover:border-[var(--theme-border-silver)] transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Top Header: Company Avatar, Verified, Bookmark */}
                      <div className="flex items-start justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center font-bold text-xs text-[var(--theme-text)] shrink-0">
                            {companyName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)] font-medium truncate">
                              <CompanyDisplay job={job} fallback="Verified Enterprise" className="truncate" />
                              <ShieldCheck size={13} className="text-[var(--theme-accent-silver)] shrink-0" />
                            </div>
                            <span className="text-[10px] font-mono text-[var(--theme-text-subtle)] truncate block">
                              {job.industry || "Technology Sector"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(e, job._id)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                            isSaved
                              ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border-[var(--theme-border-silver)]"
                              : "text-[var(--theme-text-muted)] border-[var(--theme-border)] hover:text-[var(--theme-text)]"
                          }`}
                          title={isSaved ? "Saved Job" : "Save Job"}
                        >
                          <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-base font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver)] transition-colors line-clamp-1 mb-2">
                        {job.title}
                      </h3>

                      {/* Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--theme-text-muted)] mb-4">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate max-w-[140px]">{locationText}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-[var(--theme-text)]">
                          <IndianRupee size={11} className="shrink-0" />
                          <span>{salaryText}</span>
                        </span>
                      </div>

                      {/* Skills Tags */}
                      {Array.isArray(job.skills) && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {job.skills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] truncate max-w-[110px]"
                            >
                              {s}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-[10px] font-mono text-[var(--theme-text-subtle)] self-center">
                              +{job.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-[var(--theme-text-subtle)]">
                        {renderArray(job.jobType)}
                      </span>

                      <div className="flex items-center gap-2">
                        {isApplied ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check size={13} /> Applied
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/apply/${job._id}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-[var(--theme-text)] transition-all cursor-pointer"
                          >
                            <span>Apply</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // List View Card
              return (
                <div
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  className="group rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] hover:border-[var(--theme-border-silver)] transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center font-bold text-xs text-[var(--theme-text)] shrink-0">
                      {companyName.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver)] transition-colors truncate">
                          {job.title}
                        </h3>
                        {remote && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Remote
                          </span>
                        )}
                        {hybrid && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            Hybrid
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[var(--theme-text-muted)] flex-wrap">
                        <div className="flex items-center gap-1 font-medium">
                          <CompanyDisplay job={job} fallback="Verified Enterprise" />
                          <ShieldCheck size={12} className="text-[var(--theme-accent-silver)]" />
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span className="truncate max-w-[180px]">{locationText}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1 font-mono font-semibold text-[var(--theme-text)]">
                          <IndianRupee size={11} />
                          <span>{salaryText}</span>
                        </div>
                      </div>

                      {Array.isArray(job.skills) && job.skills.length > 0 && (
                        <div className="hidden md:flex flex-wrap gap-1.5 pt-1">
                          {job.skills.slice(0, 4).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.2 rounded-md text-[10px] font-mono bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)]"
                            >
                              {s}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="text-[10px] font-mono text-[var(--theme-text-subtle)] self-center">
                              +{job.skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--theme-border)]">
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(e, job._id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isSaved
                          ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border-[var(--theme-border-silver)]"
                          : "text-[var(--theme-text-muted)] border-[var(--theme-border)] hover:text-[var(--theme-text)]"
                      }`}
                      title={isSaved ? "Saved Job" : "Save Job"}
                    >
                      <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text)] transition-all cursor-pointer min-h-[38px]"
                    >
                      View Details
                    </button>

                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 min-h-[38px]">
                        <Check size={14} /> Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/apply/${job._id}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--theme-text)] text-[var(--theme-bg)] hover:opacity-90 transition-all cursor-pointer min-h-[38px]"
                      >
                        <span>Apply</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Job Modal */}
        {selectedJob && (
          <JobDetailsModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        )}
      </div>
    </CandidateLayout>
  );
}

