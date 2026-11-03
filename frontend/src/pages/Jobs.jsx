import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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
  Target,
  Bookmark,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Calendar,
  Globe,
  Laptop,
  LayoutGrid,
  List,
  RotateCcw,
  Zap,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Layers,
} from "lucide-react";
import CompanyDisplay from "../components/CompanyDisplay";
import JobDetailsModal from "../components/JobDetailsModal";

const INDUSTRY_SUBDOMAINS = {
  "IT & Software": [
    "Software Development",
    "Data & Analytics",
    "Infrastructure & Cloud",
    "Security & Testing",
    "Design & Product",
  ],
  "Banking & Finance": [
    "Corporate & Investment Banking",
    "Core Finance & Accounting",
    "Retail Banking",
    "Wealth & Asset Management",
    "Risk & Insurance",
  ],
  "Sales & Marketing": [
    "B2B & Corporate Sales",
    "Digital Marketing",
    "Brand & Strategy",
    "Retail & B2C Sales",
    "Communications",
  ],
  "Healthcare & Pharma": [
    "Clinical & Medical",
    "Pharmaceuticals",
    "Healthcare Administration",
    "Medical Sales & Support",
    "Life Sciences",
  ],
  "Engineering & Manufacturing": [
    "Core Engineering",
    "Production & Plant Operations",
    "Quality & Process Improvement",
    "Design & Drafting",
    "Emerging Sectors",
  ],
  "Operations & Logistics": [
    "Supply Chain & Logistics",
    "E-commerce & Delivery",
    "Inventory & Warehousing",
    "Vendor Management",
    "Business Operations",
  ],
  "Customer Support": [
    "Voice Operations",
    "Non-Voice/Digital Support",
    "Technical Support",
    "Client Management",
    "Outsourcing",
  ],
  "HR & Admin": [
    "Talent Acquisition",
    "Core HR",
    "Operations & Compliance",
    "Employee Development",
    "Administration",
  ],
  "Education & EdTech": [
    "Teaching & Academics",
    "EdTech Content",
    "Student Services",
    "Institutional Operations",
    "Corporate Training",
  ],
};

const POPULAR_SEARCH_TAGS = [
  "Remote",
  "Frontend",
  "Backend",
  "Full Stack",
  "Design",
  "Data",
  "Sales",
  "Finance",
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
    subdomain: queryParams.get("subdomain") || "",
    stipend: 0,
    workFromHome: false,
    partTime: false,
    fullTime: false,
    contract: false,
    internship: false,
    datePosted: "all", // "all" | "24h" | "7d" | "30d"
  });

  // Search Bar Local Input State (allows typing before pressing Enter or clicking search)
  const [searchTitle, setSearchTitle] = useState(queryParams.get("title") || "");
  const [searchLocation, setSearchLocation] = useState(queryParams.get("location") || "");

  // Sync state whenever URL query params change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newTitle = params.get("title") !== null ? (params.get("title") || "") : filters.profile;
    const newLoc = params.get("location") !== null ? (params.get("location") || "") : filters.location;
    const newInd = params.get("industry") !== null ? (params.get("industry") || "") : filters.industry;
    const newSub = params.get("subdomain") !== null ? (params.get("subdomain") || "") : filters.subdomain;

    setFilters((prev) => ({
      ...prev,
      profile: newTitle,
      location: newLoc,
      industry: newInd,
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

  // Bookmarked Jobs State (synced with localStorage key 'jobone_saved_jobs')
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const saved = localStorage.getItem("jobone_saved_jobs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toggle Bookmark Handler
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
    } catch {}
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
                j.status !== "deadline passed",
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

      // Industry & Subdomain
      const matchIndustry = filters.industry ? job.industry === filters.industry : true;
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
    else if (key === "industry") setFilters((prev) => ({ ...prev, industry: "", subdomain: "" }));
    else setFilters((prev) => ({ ...prev, [key]: typeof prev[key] === "boolean" ? false : "" }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24 selection:bg-blue-600 selection:text-white transition-colors duration-150">
      
      {/* ─── 1. HERO COMMAND SEARCH BANNER ───────────────────────────────── */}
      <div className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-transparent dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/70 dark:border-slate-800/80 overflow-hidden">
        {/* Subtle decorative glow spots */}
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Title & Badges */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs font-bold text-slate-700 dark:text-slate-300 mb-4">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Verified Job Listings & Direct Hiring</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-blue-600 dark:text-blue-400">{allJobs.length} Live Openings</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Discover Opportunities Built for Your Ambition
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 font-medium">
              Explore thousands of verified roles across top technology, finance, engineering, and creative enterprises.
            </p>
          </div>

          {/* Unified Hero Command Search Box */}
          <form
            onSubmit={handleExecuteSearch}
            className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-2.5 sm:p-3 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/80 border border-slate-200/90 dark:border-slate-800 transition-all flex flex-col md:flex-row items-stretch gap-2"
          >
            {/* Input: Job title or keywords */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
              <Search className="text-blue-600 dark:text-blue-400 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Job title, skills, or company..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />
              {searchTitle && (
                <button
                  type="button"
                  onClick={() => setSearchTitle("")}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Input: Location */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
              <MapPin className="text-rose-500 shrink-0" size={18} />
              <input
                type="text"
                placeholder="City, state, or 'Remote'..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />
              {searchLocation && (
                <button
                  type="button"
                  onClick={() => setSearchLocation("")}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shrink-0"
            >
              <Search size={16} />
              <span>Find Jobs</span>
            </button>
          </form>

          {/* Popular Tag Quick Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-4xl mx-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sparkles size={13} className="text-amber-500" />
              <span>Popular searches:</span>
            </span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-2xs"
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                All Available Roles
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-extrabold">
                {filteredJobs.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Showing matching postings filtered by your preferences
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Filter size={14} className="text-blue-600" />
              <span>Filters</span>
              {activeFiltersList.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersList.length}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <ArrowUpDown size={13} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="newest">Most Recent</option>
                <option value="salary_high">Highest Salary</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle (List vs Grid) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => handleToggleViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleToggleViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Strip */}
        {activeFiltersList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 pb-2">
            <span className="text-xs font-bold text-slate-400 mr-1">Active filters:</span>
            {activeFiltersList.map((item) => (
              <span
                key={item.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold"
              >
                <span>{item.label}</span>
                <button
                  type="button"
                  onClick={() => removeSingleFilter(item.key)}
                  className="hover:text-blue-900 dark:hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 underline ml-2 cursor-pointer transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Dual-Column Layout: Sidebar Filters + Jobs Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
          
          {/* ──── DESKTOP SIDEBAR FILTERS (3 of 12 cols) ───────────────── */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-blue-600" />
                  <span>Filter Roles</span>
                </h3>
                {activeFiltersList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Filter Section: Industry & Subdomain */}
              <div className="space-y-3.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  Industry & Sector
                </label>
                <select
                  value={filters.industry}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      industry: e.target.value,
                      subdomain: "",
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">All Industries</option>
                  {Object.keys(INDUSTRY_SUBDOMAINS).map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>

                {filters.industry && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Speciality / Function
                    </label>
                    <select
                      value={filters.subdomain}
                      onChange={(e) => setFilters({ ...filters, subdomain: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">All {filters.industry} Roles</option>
                      {INDUSTRY_SUBDOMAINS[filters.industry].map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Filter Section: Work Mode (Remote / WFH) */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  Work Mode
                </label>
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.workFromHome}
                    onChange={(e) => setFilters({ ...filters, workFromHome: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Remote / Work from Home
                  </span>
                </label>
              </div>

              {/* Filter Section: Employment Type */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  Employment Type
                </label>
                {[
                  { key: "fullTime", label: "Full-Time" },
                  { key: "partTime", label: "Part-Time" },
                  { key: "contract", label: "Contract" },
                  { key: "internship", label: "Internship" },
                ].map((type) => (
                  <label key={type.key} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters[type.key]}
                      onChange={(e) => setFilters({ ...filters, [type.key]: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Filter Section: Minimum Salary */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Min Salary (Monthly)
                  </label>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400">
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
                  className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>₹0</span>
                  <span>₹1,00,000</span>
                  <span>₹2,00,000+</span>
                </div>
              </div>

              {/* Filter Section: Date Posted */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  Date Posted
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        filters.datePosted === p.val
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
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
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="relative ml-auto w-full max-w-sm bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Filter size={18} className="text-blue-600" />
                      <span>Filter Postings</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowMobileFilters(false)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Industry on mobile */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Industry
                    </label>
                    <select
                      value={filters.industry}
                      onChange={(e) =>
                        setFilters({ ...filters, industry: e.target.value, subdomain: "" })
                      }
                      className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
                    >
                      <option value="">All Industries</option>
                      {Object.keys(INDUSTRY_SUBDOMAINS).map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remote checkbox on mobile */}
                  <label className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.workFromHome}
                      onChange={(e) => setFilters({ ...filters, workFromHome: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600"
                    />
                    <span>Remote / Work from home only</span>
                  </label>

                  {/* Salary slider on mobile */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Min Salary</span>
                      <span className="text-blue-600 font-extrabold">₹{filters.stipend.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200000"
                      step="5000"
                      value={filters.stipend}
                      onChange={(e) => setFilters({ ...filters, stipend: Number(e.target.value) })}
                      className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs"
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
              /* Loading Skeleton */
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 animate-pulse flex flex-col justify-between h-48 shadow-xs"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/4" />
                      </div>
                    </div>
                    <div className="h-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 p-8 shadow-xs">
                <p className="text-rose-600 dark:text-rose-400 font-bold text-base mb-2">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
                >
                  Refresh Page
                </button>
              </div>
            ) : filteredJobs.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400 shadow-xs">
                  <Search size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  No matching jobs found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-md mx-auto">
                  We couldn't find any openings matching your search criteria. Try broadening your keywords or clearing some filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md shadow-blue-600/20 transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* ─── GRID VIEW ────────────────────────────────────────── */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job) => {
                  const isBookmarked = savedJobIds.includes(job._id);
                  const displayLocation =
                    typeof job.location === "object"
                      ? job.location?.address || "Remote"
                      : job.location || "Remote";

                  return (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3, transition: { duration: 0.18 } }}
                      onClick={() => setSelectedJob(job)}
                      className="group bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
                    >
                      <div>
                        {/* Card Top: Logo, Company & Bookmark */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-base text-blue-600 dark:text-blue-400 shrink-0 overflow-hidden shadow-2xs">
                              {job.postedByImage ? (
                                <img
                                  src={job.postedByImage}
                                  alt="Company"
                                  className="w-full h-full object-cover"
                                />
                              ) : job.postedByCompany ? (
                                job.postedByCompany.charAt(0).toUpperCase()
                              ) : (
                                <Building2 size={20} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                                <CompanyDisplay job={job} fallback="Confidential Employer" />
                              </p>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Actively Hiring
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => toggleBookmark(e, job._id)}
                            title={isBookmarked ? "Remove bookmark" : "Save job"}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isBookmarked
                                ? "bg-amber-50 dark:bg-amber-950/80 border-amber-300 text-amber-500"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            }`}
                          >
                            <Bookmark
                              size={15}
                              className={isBookmarked ? "fill-amber-500" : ""}
                            />
                          </button>
                        </div>

                        {/* Job Title */}
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
                          {job.title}
                        </h3>

                        {/* Key Pills */}
                        <div className="flex flex-wrap gap-1.5 mb-4 text-xs font-bold">
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px]">
                            <MapPin size={12} className="text-rose-500 shrink-0" />
                            <span className="truncate max-w-[130px]">{displayLocation}</span>
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] capitalize">
                            <Briefcase size={12} className="shrink-0" />
                            <span>{renderArray(job.jobType)}</span>
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px]">
                            <IndianRupee size={12} className="shrink-0" />
                            <span>
                              {job.salaryMin === 0 && job.salaryMax === 0
                                ? "Unpaid"
                                : `${job.salaryMin?.toLocaleString() || 0} - ${job.salaryMax?.toLocaleString() || 0}`}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Card Bottom: Timestamp & View CTA */}
                      <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock size={12} />
                          <span>{formatTimeAgo(job.postedAt || job.createdAt)}</span>
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-extrabold">
                          <span>Details</span>
                          <ArrowRight size={13} />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* ─── LIST VIEW ────────────────────────────────────────── */
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const isBookmarked = savedJobIds.includes(job._id);
                  const displayLocation =
                    typeof job.location === "object"
                      ? job.location?.address || "Remote"
                      : job.location || "Remote";

                  return (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2, transition: { duration: 0.18 } }}
                      onClick={() => setSelectedJob(job)}
                      className="group bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        
                        {/* Company Logo & Core Details */}
                        <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
                          {/* Logo Monogram */}
                          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 shrink-0 overflow-hidden shadow-xs">
                            {job.postedByImage ? (
                              <img
                                src={job.postedByImage}
                                alt="Company"
                                className="w-full h-full object-cover"
                              />
                            ) : job.postedByCompany ? (
                              job.postedByCompany.charAt(0).toUpperCase()
                            ) : (
                              <Building2 size={24} />
                            )}
                          </div>

                          {/* Titles, Company & Pills */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                                <CompanyDisplay job={job} fallback="Confidential Employer" />
                              </p>
                              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Direct Hiring
                              </span>
                            </div>

                            <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-2.5">
                              {job.title}
                            </h3>

                            {/* Metadata Chips */}
                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                                <MapPin size={13} className="text-rose-500 shrink-0" />
                                <span className="truncate max-w-[140px] sm:max-w-[200px]">{displayLocation}</span>
                              </span>

                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60 capitalize">
                                <Briefcase size={13} className="shrink-0" />
                                <span>{renderArray(job.jobType)}</span>
                              </span>

                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60">
                                <IndianRupee size={13} className="shrink-0" />
                                <span>
                                  {job.salaryMin === 0 && job.salaryMax === 0
                                    ? "Unpaid"
                                    : `${job.salaryMin?.toLocaleString() || 0} - ${job.salaryMax?.toLocaleString() || 0}`}
                                </span>
                              </span>

                              {job.industry && (
                                <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/60">
                                  <Target size={13} className="shrink-0" />
                                  <span>{job.industry}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Bookmark, Time Ago, View Details */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock size={12} />
                              <span>{formatTimeAgo(job.postedAt || job.createdAt)}</span>
                            </span>

                            <button
                              type="button"
                              onClick={(e) => toggleBookmark(e, job._id)}
                              title={isBookmarked ? "Remove bookmark" : "Save this job"}
                              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                isBookmarked
                                  ? "bg-amber-50 dark:bg-amber-950/80 border-amber-300 text-amber-500"
                                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                              }`}
                            >
                              <Bookmark
                                size={15}
                                className={isBookmarked ? "fill-amber-500" : ""}
                              />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="px-5 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200/80 dark:border-blue-800/60 transition-all cursor-pointer shadow-xs"
                          >
                            View Details
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
