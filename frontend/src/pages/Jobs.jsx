import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import CompanyDisplay from "../components/CompanyDisplay";
import JobDetailsModal from "../components/JobDetailsModal";
import { INDUSTRIES, DEPARTMENTS, normalizeIndustry, getDepartmentsForIndustry } from "../constants/taxonomy";

const POPULAR_SEARCH_TAGS = [
  "Remote",
  "Frontend",
  "Backend",
  "Full Stack",
  "Design",
  "DevOps",
  "Finance",
  "Data",
];

export default function Jobs() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // Filters State
  const [filters, setFilters] = useState({
    profile: queryParams.get("title") || "",
    location: queryParams.get("location") || "",
    industry: queryParams.get("industry") || "",
    department: queryParams.get("department") || "",
    subdomain: queryParams.get("subdomain") || "",
    stipend: 0,
    workFromHome: false,
    partTime: false,
    fullTime: false,
    contract: false,
    internship: false,
    datePosted: "all", // "all" | "24h" | "7d" | "30d"
  });

  // Local Search Bar State
  const [searchTitle, setSearchTitle] = useState(queryParams.get("title") || "");
  const [searchLocation, setSearchLocation] = useState(queryParams.get("location") || "");

  // Sync state whenever URL query params change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newTitle = params.get("title") !== null ? (params.get("title") || "") : filters.profile;
    const newLoc = params.get("location") !== null ? (params.get("location") || "") : filters.location;
    const newInd = params.get("industry") !== null ? (params.get("industry") || "") : filters.industry;
    const newDept = params.get("department") !== null ? (params.get("department") || "") : filters.department;
    const newSub = params.get("subdomain") !== null ? (params.get("subdomain") || "") : filters.subdomain;

    setFilters((prev) => ({
      ...prev,
      profile: newTitle,
      location: newLoc,
      industry: newInd,
      department: newDept,
      subdomain: newSub,
    }));
    setSearchTitle(newTitle);
    setSearchLocation(newLoc);
  }, [location.search]);

  // Jobs, UI, & Layout States
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem("jobone_jobs_view_mode") || "list";
    } catch {
      return "list";
    }
  });
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "salary_high" | "title_asc"

  // Bookmarked Jobs State
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const saved = localStorage.getItem("jobone_saved_jobs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (e, jobId) => {
    e.stopPropagation();
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      try {
        localStorage.setItem("jobone_saved_jobs", JSON.stringify(next));
      } catch (err) {
        console.error("Error saving bookmark:", err);
      }
      return next;
    });
  };

  const handleToggleViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("jobone_jobs_view_mode", mode);
    } catch (_err) {
      /* ignore */
    }
  };

  // Fetch Jobs from backend API
  useEffect(() => {
    const controller = new AbortController();

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/jobs`, {
          signal: controller.signal,
        });
        const jobsData =
          res.data.data ||
          res.data.results ||
          (Array.isArray(res.data) ? res.data : []);

        const activeJobs = Array.isArray(jobsData)
          ? jobsData.filter(
              (j) =>
                j.status !== "inactive" &&
                j.status !== "closed" &&
                j.status !== "deadline passed"
            )
          : [];
        setAllJobs(activeJobs);
      } catch (err) {
        if (axios.isCancel(err) || err.name === "CanceledError" || err.name === "AbortError") {
          return;
        }
        console.error("Failed to load jobs:", err);
        setError("Unable to load jobs at this moment. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    return () => {
      controller.abort();
    };
  }, []);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileFilters]);

  // Helpers
  const renderArray = (val) => {
    if (!val) return "Full-Time";
    if (Array.isArray(val))
      return val.length > 0 ? val.join(", ") : "Full-Time";
    return String(val);
  };

  const getArraySafe = (val) => {
    if (!val) return [];
    return Array.isArray(val)
      ? val.map((v) => String(v).toLowerCase())
      : [String(val).toLowerCase()];
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  };

  const formatSalary = (job) => {
    const sMin = Number(job.salaryMin) || Number(job.salaryAmount) || 0;
    const sMax = Number(job.salaryMax) || Number(job.salaryAmount) || 0;

    if (sMin === 0 && sMax === 0) return "Competitive";

    const toK = (val) => {
      if (val >= 10000000) return `${(val / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
      if (val >= 100000) return `${(val / 100000).toFixed(1).replace(/\.0$/, "")}L`;
      if (val >= 1000) return `${Math.round(val / 1000)}k`;
      return val.toLocaleString();
    };

    if (sMin > 0 && sMax > 0 && sMin !== sMax) {
      return `₹${toK(sMin)} - ₹${toK(sMax)}`;
    }
    if (sMin > 0) return `₹${toK(sMin)}`;
    if (sMax > 0) return `₹${toK(sMax)}`;
    return "Competitive";
  };

  // Execute Search from Hero Bar
  const handleExecuteSearch = (e) => {
    if (e) e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      profile: searchTitle,
      location: searchLocation,
    }));
  };

  // Quick Search by Tag Click
  const handleTagClick = (tag) => {
    if (tag.toLowerCase() === "remote") {
      setFilters((prev) => ({ ...prev, workFromHome: true }));
    } else {
      setSearchTitle(tag);
      setFilters((prev) => ({ ...prev, profile: tag }));
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      profile: "",
      location: "",
      industry: "",
      department: "",
      subdomain: "",
      stipend: 0,
      workFromHome: false,
      partTime: false,
      fullTime: false,
      contract: false,
      internship: false,
      datePosted: "all",
    });
    setSearchTitle("");
    setSearchLocation("");
    navigate("/jobs", { replace: true });
  };

  // Filter & Sorting Logic
  const filteredJobs = useMemo(() => {
    const result = allJobs.filter((job) => {
      const jobLocation =
        typeof job.location === "object"
          ? job.location?.address?.toLowerCase() || ""
          : job.location?.toLowerCase() || "";
      const title = job.title?.toLowerCase() || "";
      const company = (job.postedByCompany || job.postedByName || "").toLowerCase();
      const skills = Array.isArray(job.skills) ? job.skills.join(" ").toLowerCase() : "";

      const salary = Number(job.salaryMin) || Number(job.salaryAmount) || 0;
      const jobTypes = getArraySafe(job.jobType);
      const modes = getArraySafe(job.mode);

      // Search matching (Title, Description, Skills, Company)
      const matchProfile = filters.profile
        ? title.includes(filters.profile.toLowerCase()) ||
          job.description?.toLowerCase().includes(filters.profile.toLowerCase()) ||
          skills.includes(filters.profile.toLowerCase()) ||
          company.includes(filters.profile.toLowerCase())
        : true;

      // Location matching
      const matchLocation = filters.location
        ? jobLocation.includes(filters.location.toLowerCase()) ||
          (filters.location.toLowerCase() === "remote" &&
            (modes.some((m) => m.includes("home") || m.includes("online")) || title.includes("remote")))
        : true;

      // Minimum Salary filter
      const matchSalary = filters.stipend ? salary >= Number(filters.stipend) : true;

      // Work Mode (Remote / WFH)
      const matchWFH = filters.workFromHome
        ? modes.some((m) => m.includes("home") || m.includes("online") || m.includes("remote")) ||
          title.includes("remote")
        : true;

      // Job Type filters
      const matchPartTime = filters.partTime ? jobTypes.some((t) => t.includes("part-time")) : true;
      const matchFullTime = filters.fullTime ? jobTypes.some((t) => t.includes("full-time")) : true;
      const matchContract = filters.contract ? jobTypes.some((t) => t.includes("contract")) : true;
      const matchInternship = filters.internship ? jobTypes.some((t) => t.includes("intern")) : true;

      // Genuine Industry & Department Separation
      const matchIndustry = filters.industry
        ? (normalizeIndustry(job.industry)?.name === normalizeIndustry(filters.industry)?.name ||
           (job.industry || "").toLowerCase().includes(filters.industry.toLowerCase()))
        : true;
      const matchDepartment = filters.department
        ? ((job.department && job.department.toLowerCase() === filters.department.toLowerCase()) ||
           (job.subdomain && job.subdomain.toLowerCase() === filters.department.toLowerCase()))
        : true;
      const matchSubdomain = filters.subdomain ? job.subdomain === filters.subdomain : true;

      // Date Posted
      let matchDate = true;
      if (filters.datePosted !== "all") {
        const postedTime = new Date(job.postedAt || job.createdAt).getTime();
        const now = Date.now();
        if (filters.datePosted === "24h") matchDate = now - postedTime <= 24 * 60 * 60 * 1000;
        else if (filters.datePosted === "7d") matchDate = now - postedTime <= 7 * 24 * 60 * 60 * 1000;
        else if (filters.datePosted === "30d") matchDate = now - postedTime <= 30 * 24 * 60 * 60 * 1000;
      }

      return (
        matchProfile &&
        matchLocation &&
        matchSalary &&
        matchWFH &&
        matchPartTime &&
        matchFullTime &&
        matchContract &&
        matchInternship &&
        matchIndustry &&
        matchDepartment &&
        matchSubdomain &&
        matchDate
      );
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === "salary_high") {
        const salA = Number(a.salaryMax || a.salaryMin || 0);
        const salB = Number(b.salaryMax || b.salaryMin || 0);
        return salB - salA;
      }
      if (sortBy === "title_asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      // Default: newest
      const dateA = new Date(a.postedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.postedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [allJobs, filters, sortBy]);

  // Compute active filters count
  const activeFiltersList = useMemo(() => {
    const list = [];
    if (filters.profile) list.push({ key: "profile", label: `Keyword: "${filters.profile}"` });
    if (filters.location) list.push({ key: "location", label: `Location: "${filters.location}"` });
    if (filters.industry) list.push({ key: "industry", label: `Industry: ${filters.industry}` });
    if (filters.department) list.push({ key: "department", label: `Department: ${filters.department}` });
    if (filters.subdomain) list.push({ key: "subdomain", label: `Speciality: ${filters.subdomain}` });
    if (filters.stipend > 0) list.push({ key: "stipend", label: `Min ₹${Number(filters.stipend).toLocaleString()}` });
    if (filters.workFromHome) list.push({ key: "workFromHome", label: "Remote / WFH" });
    if (filters.fullTime) list.push({ key: "fullTime", label: "Full-Time" });
    if (filters.partTime) list.push({ key: "partTime", label: "Part-Time" });
    if (filters.contract) list.push({ key: "contract", label: "Contract" });
    if (filters.internship) list.push({ key: "internship", label: "Internship" });
    if (filters.datePosted !== "all") list.push({ key: "datePosted", label: `Posted: ${filters.datePosted}` });
    return list;
  }, [filters]);

  const removeSingleFilter = (key) => {
    if (key === "stipend") setFilters((prev) => ({ ...prev, stipend: 0 }));
    else if (key === "datePosted") setFilters((prev) => ({ ...prev, datePosted: "all" }));
    else if (key === "industry") setFilters((prev) => ({ ...prev, industry: "", department: "", subdomain: "" }));
    else if (key === "department") setFilters((prev) => ({ ...prev, department: "" }));
    else setFilters((prev) => ({ ...prev, [key]: typeof prev[key] === "boolean" ? false : "" }));
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans pb-24 transition-colors duration-150">
      
      {/* ─── 1. HERO COMMAND SEARCH BANNER ───────────────────────────────── */}
      <div className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 bg-[var(--theme-surface)] border-b border-[var(--theme-border)] overflow-hidden">
        {/* Subtle Ambient Light Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Title & Badges */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)] mb-4 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-[var(--theme-text)]">Verified Enterprise Requisitions</span>
              <span className="text-[var(--theme-text-subtle)]">•</span>
              <span className="text-[var(--theme-text-muted)] font-mono">{allJobs.length} Live Openings</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--theme-text)] tracking-tight leading-tight">
              Discover Positions Engineered for Impact
            </h1>
            <p className="text-sm sm:text-base text-[var(--theme-text-muted)] mt-3 font-normal max-w-xl mx-auto leading-relaxed">
              Direct recruitment listings from verified enterprises. Authentic compensation metrics, transparent pipelines, and one-click applications.
            </p>
          </div>

          {/* Unified Architectural Search Box */}
          <form
            onSubmit={handleExecuteSearch}
            className="max-w-4xl mx-auto bg-[var(--theme-surface-elevated)] rounded-2xl md:rounded-full p-2.5 border border-[var(--theme-border-silver)] shadow-2xl flex flex-col md:flex-row items-stretch gap-2 transition-all focus-within:border-[var(--theme-border-focus)]"
          >
            {/* Input: Job title or keywords */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl md:rounded-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]">
              <Search className="text-[var(--theme-accent-silver)] shrink-0" size={17} />
              <input
                type="text"
                placeholder="Job title, technical skills, or company..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                aria-label="Job title or keywords"
                className="w-full bg-transparent text-sm font-medium text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] outline-none"
              />
              {searchTitle && (
                <button
                  type="button"
                  onClick={() => setSearchTitle("")}
                  className="p-1 text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] cursor-pointer"
                  aria-label="Clear title search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Input: Location */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl md:rounded-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]">
              <MapPin className="text-[var(--theme-accent-silver)] shrink-0" size={17} />
              <input
                type="text"
                placeholder="City, region, or 'Remote'..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                aria-label="Location"
                className="w-full bg-transparent text-sm font-medium text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] outline-none"
              />
              {searchLocation && (
                <button
                  type="button"
                  onClick={() => setSearchLocation("")}
                  className="p-1 text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] cursor-pointer"
                  aria-label="Clear location search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-7 py-3 rounded-xl md:rounded-full bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
            >
              <Search size={15} className="text-[var(--theme-accent-silver)]" />
              <span>Search</span>
            </button>
          </form>

          {/* Popular Tag Quick Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-3xl mx-auto text-xs text-[var(--theme-text-subtle)]">
            <span className="font-semibold flex items-center gap-1 text-[var(--theme-text-muted)]">
              <Sparkles size={13} className="text-[var(--theme-accent-silver)]" />
              <span>Popular searches:</span>
            </span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer text-xs font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN CONTENT LAYOUT: FILTERS & JOB LISTINGS ────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Top Control Bar: Results Count, Active Filters, Sorting & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--theme-border)]">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-[var(--theme-text)] tracking-tight">
                Available Positions
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-bold font-mono">
                {filteredJobs.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-0.5 font-normal">
              Requisitions filtered by your active preferences
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden px-4 py-2 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Filter size={14} className="text-[var(--theme-accent-silver)]" />
              <span>Filters</span>
              {activeFiltersList.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersList.length}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[var(--theme-surface)] px-3 py-1.5 rounded-xl border border-[var(--theme-border)] shadow-xs">
              <ArrowUpDown size={13} className="text-[var(--theme-text-subtle)]" />
              <span className="text-xs font-semibold text-[var(--theme-text-muted)] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--theme-text)] outline-none cursor-pointer"
              >
                <option value="newest" className="bg-[var(--theme-surface)] text-[var(--theme-text)]">Most Recent</option>
                <option value="salary_high" className="bg-[var(--theme-surface)] text-[var(--theme-text)]">Highest Salary</option>
                <option value="title_asc" className="bg-[var(--theme-surface)] text-[var(--theme-text)]">Title (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle (List vs Grid) */}
            <div className="flex items-center bg-[var(--theme-surface)] p-1 rounded-xl border border-[var(--theme-border)]">
              <button
                type="button"
                onClick={() => handleToggleViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-xs"
                    : "text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)]"
                }`}
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleToggleViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-xs"
                    : "text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)]"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Strip */}
        {activeFiltersList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 pb-2">
            <span className="text-xs font-semibold text-[var(--theme-text-subtle)] mr-1">Active filters:</span>
            {activeFiltersList.map((item) => (
              <span
                key={item.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] text-xs font-medium"
              >
                <span>{item.label}</span>
                <button
                  type="button"
                  onClick={() => removeSingleFilter(item.key)}
                  className="hover:text-[var(--theme-accent-silver-sheen)] cursor-pointer"
                  aria-label={`Remove filter ${item.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] underline ml-2 cursor-pointer transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Dual-Column Layout: Sidebar Filters + Jobs Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
          
          {/* ──── DESKTOP SIDEBAR FILTERS (3 of 12 cols) ───────────────── */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6">
            <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] p-6 shadow-sm space-y-6 transition-colors">
              <div className="flex items-center justify-between pb-3.5 border-b border-[var(--theme-border)]">
                <h3 className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-[var(--theme-accent-silver)]" />
                  <span>Filter Roles</span>
                </h3>
                {activeFiltersList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Filter Section: Industry & Department */}
              <div className="space-y-3.5">
                <label className="text-[11px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider block">
                  Industry Sector
                </label>
                <select
                  value={filters.industry}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      industry: e.target.value,
                      department: "",
                      subdomain: "",
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-xs font-medium text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-focus)] cursor-pointer"
                >
                  <option value="">All Industries (24 Sectors)</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.id} value={ind.name} className="bg-[var(--theme-surface)] text-[var(--theme-text)]">
                      {ind.name}
                    </option>
                  ))}
                </select>

                <div>
                  <label className="text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider mb-1.5 block">
                    Department / Functional Area
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-xs font-medium text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-focus)] cursor-pointer"
                  >
                    <option value="">
                      {filters.industry ? `All ${filters.industry} Departments` : "All Departments"}
                    </option>
                    {(filters.industry ? getDepartmentsForIndustry(filters.industry) : DEPARTMENTS).map((dept) => (
                      <option key={dept} value={dept} className="bg-[var(--theme-surface)] text-[var(--theme-text)]">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Section: Work Mode (Remote / WFH) */}
              <div className="pt-4 border-t border-[var(--theme-border)] space-y-3">
                <label className="text-[11px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider block">
                  Workplace Mode
                </label>
                <label className="flex items-center gap-2.5 text-xs font-medium text-[var(--theme-text)] cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.workFromHome}
                    onChange={(e) => setFilters({ ...filters, workFromHome: e.target.checked })}
                    className="w-4 h-4 rounded accent-[var(--theme-accent-silver)] cursor-pointer"
                  />
                  <span className="group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors">
                    Remote / Work from Home Only
                  </span>
                </label>
              </div>

              {/* Filter Section: Employment Type */}
              <div className="pt-4 border-t border-[var(--theme-border)] space-y-3">
                <label className="text-[11px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider block">
                  Employment Type
                </label>
                {[
                  { key: "fullTime", label: "Full-Time" },
                  { key: "partTime", label: "Part-Time" },
                  { key: "contract", label: "Contract Requisition" },
                  { key: "internship", label: "Internship" },
                ].map((type) => (
                  <label key={type.key} className="flex items-center gap-2.5 text-xs font-medium text-[var(--theme-text)] cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters[type.key]}
                      onChange={(e) => setFilters({ ...filters, [type.key]: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--theme-accent-silver)] cursor-pointer"
                    />
                    <span className="group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Filter Section: Minimum Salary */}
              <div className="pt-4 border-t border-[var(--theme-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">
                    Min Compensation
                  </label>
                  <span className="text-xs font-bold font-mono text-[var(--theme-text)]">
                    ₹{Number(filters.stipend).toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={filters.stipend}
                  onChange={(e) => setFilters({ ...filters, stipend: Number(e.target.value) })}
                  className="w-full accent-[var(--theme-accent-silver)] h-1.5 bg-[var(--theme-surface-elevated)] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-semibold text-[var(--theme-text-subtle)]">
                  <span>₹0</span>
                  <span>₹1L</span>
                  <span>₹2L+</span>
                </div>
              </div>

              {/* Filter Section: Date Posted */}
              <div className="pt-4 border-t border-[var(--theme-border)] space-y-3">
                <label className="text-[11px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider block">
                  Date Published
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "all", label: "Anytime" },
                    { val: "24h", label: "Past 24h" },
                    { val: "7d", label: "Past Week" },
                    { val: "30d", label: "Past Month" },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setFilters({ ...filters, datePosted: p.val })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        filters.datePosted === p.val
                          ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-xs"
                          : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-text)]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ──── MOBILE FILTER DRAWER OVERLAY ─────────────────────────── */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="relative ml-auto w-full max-w-sm bg-[var(--theme-surface)] border-l border-[var(--theme-border)] h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--theme-border)]">
                    <h3 className="text-base font-bold text-[var(--theme-text)] flex items-center gap-2">
                      <Filter size={16} className="text-[var(--theme-accent-silver)]" />
                      <span>Filter Requisitions</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowMobileFilters(false)}
                      className="p-1.5 rounded-xl text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] cursor-pointer"
                      aria-label="Close filters"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Industry on mobile */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider mb-2 block">
                        Industry Sector
                      </label>
                      <select
                        value={filters.industry}
                        onChange={(e) =>
                          setFilters({ ...filters, industry: e.target.value, department: "", subdomain: "" })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-xs font-medium text-[var(--theme-text)] outline-none"
                      >
                        <option value="">All Industries (24 Sectors)</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind.id} value={ind.name} className="bg-[var(--theme-surface)] text-[var(--theme-text)]">
                            {ind.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider mb-2 block">
                        Department / Function
                      </label>
                      <select
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-xs font-medium text-[var(--theme-text)] outline-none"
                      >
                        <option value="">
                          {filters.industry ? `All ${filters.industry} Departments` : "All Departments"}
                        </option>
                        {(filters.industry ? getDepartmentsForIndustry(filters.industry) : DEPARTMENTS).map((dept) => (
                          <option key={dept} value={dept} className="bg-[var(--theme-surface)] text-[var(--theme-text)]">
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Remote checkbox on mobile */}
                  <label className="flex items-center gap-3 text-xs font-medium text-[var(--theme-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.workFromHome}
                      onChange={(e) => setFilters({ ...filters, workFromHome: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--theme-accent-silver)]"
                    />
                    <span>Remote / Work from home only</span>
                  </label>

                  {/* Salary slider on mobile */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[var(--theme-text-muted)]">Min Salary</span>
                      <span className="text-[var(--theme-text)] font-bold font-mono">₹{filters.stipend.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200000"
                      step="5000"
                      value={filters.stipend}
                      onChange={(e) => setFilters({ ...filters, stipend: Number(e.target.value) })}
                      className="w-full accent-[var(--theme-accent-silver)] h-1.5 bg-[var(--theme-surface-elevated)] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--theme-border)] flex gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex-1 py-3 rounded-xl bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-xs border border-[var(--theme-border)] cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 py-3 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──── JOB LISTINGS CONTENT (9 of 12 cols) ───────────────────── */}
          <main className="lg:col-span-9 w-full">
            {loading ? (
              /* Loading Skeletons */
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)] animate-pulse flex flex-col justify-between h-44 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-muted)] shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-[var(--theme-surface-muted)] rounded w-1/3" />
                        <div className="h-3 bg-[var(--theme-surface-muted)] rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-8 bg-[var(--theme-surface-muted)] rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-danger)]/30 p-8 shadow-sm">
                <p className="text-rose-400 font-bold text-sm mb-3">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs cursor-pointer"
                >
                  Reload Openings
                </button>
              </div>
            ) : filteredJobs.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] p-8 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center mx-auto mb-4 text-[var(--theme-accent-silver)]">
                  <Search size={24} />
                </div>
                <h3 className="text-lg font-bold text-[var(--theme-text)]">
                  No matching positions found
                </h3>
                <p className="text-[var(--theme-text-muted)] text-xs sm:text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
                  We could not find active requisitions matching your filter parameters. Try broadening keywords or clearing selected filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs cursor-pointer shadow-sm transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* ─── GRID VIEW: EDITORIAL + DISTINCTIVE CARDS ─────────── */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job) => {
                  const isBookmarked = savedJobIds.includes(job._id);
                  const displayLocation =
                    typeof job.location === "object"
                      ? job.location?.address || "Remote"
                      : job.location || "Remote";
                  const formattedSalary = formatSalary(job);

                  return (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3, transition: { duration: 0.18 } }}
                      onClick={() => setSelectedJob(job)}
                      className="group bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
                    >
                      {/* Top Sheen */}
                      <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div>
                        {/* Top: Logo, Company & Bookmark */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center font-bold text-sm text-[var(--theme-text)] shrink-0 overflow-hidden p-2">
                              {job.postedByImage ? (
                                <img
                                  src={job.postedByImage}
                                  alt="Company"
                                  className="w-full h-full object-contain"
                                />
                              ) : job.postedByCompany ? (
                                job.postedByCompany.charAt(0).toUpperCase()
                              ) : (
                                <Building2 size={20} className="text-[var(--theme-accent-silver)]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[var(--theme-text)] truncate group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors">
                                <CompanyDisplay job={job} fallback="Confidential Employer" />
                              </p>
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Verified Requisition
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => toggleBookmark(e, job._id)}
                            title={isBookmarked ? "Remove bookmark" : "Save job"}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              isBookmarked
                                ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-border-silver)] text-amber-400"
                                : "bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)]"
                            }`}
                          >
                            <Bookmark
                              size={15}
                              className={isBookmarked ? "fill-amber-400" : ""}
                            />
                          </button>
                        </div>

                        {/* Job Title */}
                        <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors line-clamp-1 mb-3">
                          {job.title}
                        </h3>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium">
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] text-[11px]">
                            <MapPin size={12} className="text-[var(--theme-accent-silver)] shrink-0" />
                            <span className="truncate max-w-[130px]">{displayLocation}</span>
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] text-[11px] capitalize">
                            <Briefcase size={12} className="text-[var(--theme-accent-silver)] shrink-0" />
                            <span>{renderArray(job.jobType)}</span>
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-[11px] font-bold">
                            <IndianRupee size={12} className="text-[var(--theme-accent-silver)] shrink-0" />
                            <span>{formattedSalary}</span>
                          </span>
                          {job.industry && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] text-[11px] truncate max-w-[150px]">
                              <span>{job.industry}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom: Timestamp & View CTA */}
                      <div className="pt-3.5 border-t border-[var(--theme-border)] flex items-center justify-between text-xs font-medium text-[var(--theme-text-muted)]">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock size={12} className="text-[var(--theme-text-subtle)]" />
                          <span>{formatTimeAgo(job.postedAt || job.createdAt)}</span>
                        </span>
                        <span className="text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors flex items-center gap-1 font-bold">
                          <span>Details</span>
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* ─── LIST VIEW: EDITORIAL + DISTINCTIVE CARDS ─────────── */
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const isBookmarked = savedJobIds.includes(job._id);
                  const displayLocation =
                    typeof job.location === "object"
                      ? job.location?.address || "Remote"
                      : job.location || "Remote";
                  const formattedSalary = formatSalary(job);

                  return (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2, transition: { duration: 0.18 } }}
                      onClick={() => setSelectedJob(job)}
                      className="group bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                    >
                      {/* Top Sheen */}
                      <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        {/* Company Logo & Details */}
                        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                          <div className="w-13 h-13 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-sm font-bold text-[var(--theme-text)] shrink-0 overflow-hidden p-2">
                            {job.postedByImage ? (
                              <img
                                src={job.postedByImage}
                                alt="Company"
                                className="w-full h-full object-contain"
                              />
                            ) : job.postedByCompany ? (
                              job.postedByCompany.charAt(0).toUpperCase()
                            ) : (
                              <Building2 size={22} className="text-[var(--theme-accent-silver)]" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-bold text-[var(--theme-text)] truncate group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors">
                                <CompanyDisplay job={job} fallback="Confidential Employer" />
                              </p>
                              <span className="w-1 h-1 rounded-full bg-[var(--theme-text-subtle)]" />
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                                <CheckCircle2 size={12} className="text-emerald-400" />
                                Verified Requisition
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors line-clamp-1 mb-2">
                              {job.title}
                            </h3>

                            {/* Metadata Chips */}
                            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] text-[11px]">
                                <MapPin size={12} className="text-[var(--theme-accent-silver)] shrink-0" />
                                <span className="truncate max-w-[140px] sm:max-w-[200px]">{displayLocation}</span>
                              </span>

                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] text-[11px] capitalize">
                                <Briefcase size={12} className="text-[var(--theme-accent-silver)] shrink-0" />
                                <span>{renderArray(job.jobType)}</span>
                              </span>

                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-[11px] font-bold">
                                <IndianRupee size={12} className="text-[var(--theme-accent-silver)] shrink-0" />
                                <span>{formattedSalary}</span>
                              </span>

                              {job.industry && (
                                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] text-[11px]">
                                  <span>{job.industry}</span>
                                </span>
                              )}
                              {job.department && (
                                <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-accent-silver)] text-[11px]">
                                  <span>{job.department}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Bookmark, Time, Details CTA */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--theme-border)]">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-[var(--theme-text-subtle)] flex items-center gap-1">
                              <Clock size={12} />
                              <span>{formatTimeAgo(job.postedAt || job.createdAt)}</span>
                            </span>

                            <button
                              type="button"
                              onClick={(e) => toggleBookmark(e, job._id)}
                              title={isBookmarked ? "Remove bookmark" : "Save this job"}
                              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                isBookmarked
                                  ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-border-silver)] text-amber-400"
                                  : "bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)]"
                              }`}
                            >
                              <Bookmark
                                size={14}
                                className={isBookmarked ? "fill-amber-400" : ""}
                              />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="px-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <span>View Details</span>
                            <ArrowRight size={13} className="text-[var(--theme-accent-silver)]" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ─── 3. JOB DETAILS MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailsModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
