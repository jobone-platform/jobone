import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CompanyDisplay from "./CompanyDisplay";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import JobDetailsModal from "../components/JobDetailsModal";

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jobone_saved_jobs") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchJobs = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/jobs?limit=6`, {
          signal: controller.signal,
        });
        const jobArray =
          data?.data ||
          data?.results ||
          (Array.isArray(data) ? data : []);
        const latestJobs = Array.isArray(jobArray)
          ? jobArray.slice(0, 6)
          : [];
        setJobs(latestJobs);
      } catch (error) {
        if (
          axios.isCancel(error) ||
          error.name === "CanceledError" ||
          error.name === "AbortError"
        ) {
          return;
        }
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    return () => {
      controller.abort();
    };
  }, []);

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

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getLocation = (job) => {
    if (!job.location) return "Remote";
    if (typeof job.location === "object")
      return job.location.address || "Remote";
    return job.location;
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
      return `${toK(sMin)} - ${toK(sMax)}`;
    }
    if (sMin > 0) return toK(sMin);
    if (sMax > 0) return toK(sMax);
    return "Competitive";
  };

  // Filter definitions
  const filterOptions = [
    { id: "all", label: "All Roles" },
    { id: "remote", label: "Remote / WFH" },
    { id: "fulltime", label: "Full-Time" },
    { id: "tech", label: "Tech & Engineering" },
  ];

  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "remote") {
      const loc = String(job.location?.address || job.location || "").toLowerCase();
      const mode = Array.isArray(job.mode)
        ? job.mode.join(" ").toLowerCase()
        : String(job.mode || "").toLowerCase();
      return loc.includes("remote") || mode.includes("home") || mode.includes("remote");
    }
    if (activeFilter === "fulltime") {
      const types = Array.isArray(job.jobType)
        ? job.jobType.join(" ").toLowerCase()
        : String(job.jobType || "").toLowerCase();
      return types.includes("full");
    }
    if (activeFilter === "tech") {
      const ind = String(job.industry || "").toLowerCase();
      const title = String(job.title || "").toLowerCase();
      return (
        ind.includes("it") ||
        ind.includes("software") ||
        title.includes("developer") ||
        title.includes("engineer") ||
        title.includes("react") ||
        title.includes("tech")
      );
    }
    return true;
  });

  const displayJobs = filteredJobs.length > 0 ? filteredJobs : jobs;

  if (loading) {
    return (
      <section className="py-20 bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl mb-10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-1/2" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-md w-4/5" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-full" />
                </div>
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <section className="py-20 bg-[#F8FAFC] dark:bg-slate-950 font-sans transition-colors duration-200 relative overflow-hidden">
      {/* Subtle ambient light glows for depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-500/5 via-blue-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Dribbble-Grade Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="space-y-3">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Live Openings &bull; Actively Hiring
              </span>
            </div>

            {/* Main Section Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Featured Job Openings
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
              Explore verified roles from high-growth tech startups and top global employers actively hiring talent this week.
            </p>
          </div>

          {/* Quick CTA to browse all jobs */}
          <div className="flex items-center gap-3">
            <Link
              to="/jobs"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/80 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <span>Explore All Roles</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/80 dark:group-hover:text-indigo-300 transition-colors">
                30+
              </span>
              <ArrowRight
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"
              />
            </Link>
          </div>
        </div>

        {/* Filter Pills Bar (Dribbble Inspired Interactive Tabs) */}
        <div className="flex flex-wrap items-center gap-2 mb-8 sm:mb-10 pb-2">
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/10 dark:shadow-none"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span>{opt.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* The Dribbble-Grade Jobs Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
        >
          {displayJobs.map((job) => {
            const locationStr = getLocation(job);
            const jobTypeDisplay =
              Array.isArray(job.jobType) && job.jobType.length > 0
                ? job.jobType[0]
                : "Full-Time";
            const formattedSalary = formatSalary(job);
            const isBookmarked = savedJobIds.includes(job._id);
            const cleanDescription = (job.jobSummary || job.description || "")
              .replace(/<[^>]+>/g, " ")
              .trim();

            return (
              <motion.div
                layout
                key={job._id}
                onClick={() => setSelectedJob(job)}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
              >
                {/* Sleek Top Hover Accent Glow */}
                <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

                <div>
                  {/* Top Row: Company Logo & Bookmark */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Company Avatar Container */}
                      <div className="w-13 h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 p-2 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                        {job.postedByImage ? (
                          <img
                            src={job.postedByImage}
                            alt="Logo"
                            className="w-full h-full object-contain rounded-xl"
                          />
                        ) : (
                          <Building2
                            size={24}
                            className="text-indigo-500 dark:text-indigo-400"
                          />
                        )}
                      </div>

                      {/* Company Name & Verification */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            <CompanyDisplay
                              job={job}
                              fallback="Company Confidential"
                            />
                          </p>
                          <CheckCircle2
                            size={14}
                            className="text-blue-500 shrink-0 fill-blue-500/10"
                            title="Verified Employer"
                          />
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {job.industry || job.subdomain || "Verified Partner"}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(e, job._id)}
                      className={`p-2.5 rounded-xl border transition-all duration-200 shrink-0 ${
                        isBookmarked
                          ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                          : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/70 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      title={isBookmarked ? "Remove bookmark" : "Save this job"}
                    >
                      <Bookmark
                        size={15}
                        className={isBookmarked ? "fill-indigo-600 dark:fill-indigo-400" : ""}
                      />
                    </button>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-3 tracking-tight">
                    {job.title}
                  </h3>

                  {/* Dribbble Pill Badges (Location, Mode, Salary) */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {/* Location Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="truncate max-w-[110px]">
                        {locationStr.split(",")[0]}
                      </span>
                    </span>

                    {/* Job Type Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100/70 dark:border-indigo-800/60 capitalize">
                      <Briefcase size={12} className="text-indigo-500 dark:text-indigo-400" />
                      {jobTypeDisplay}
                    </span>

                    {/* Salary Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100/70 dark:border-emerald-800/60">
                      <IndianRupee size={12} className="text-emerald-500 dark:text-emerald-400" />
                      {formattedSalary}
                    </span>
                  </div>

                  {/* Job Snippet Text */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal mb-4">
                    {cleanDescription || "Click to view full role overview, requirements, and responsibilities."}
                  </p>

                  {/* Skills Tags if Available */}
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      {job.skillsRequired.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 3 && (
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                          +{job.skillsRequired.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Timestamp & Modern Action Button */}
                <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    {formatTimeAgo(job.createdAt || job.postedAt)}
                  </span>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 dark:group-hover:text-white transition-all duration-200 shadow-xs"
                  >
                    <span>View Details</span>
                    <ArrowRight
                      size={13}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Real Functional Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailsModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
