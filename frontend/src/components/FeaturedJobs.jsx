import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
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
  ShieldCheck,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import CompanyDisplay from "./CompanyDisplay";
import JobDetailsModal from "./JobDetailsModal";

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
        console.error("Error fetching featured jobs:", error);
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
      return `₹${toK(sMin)} - ₹${toK(sMax)}`;
    }
    if (sMin > 0) return `₹${toK(sMin)}`;
    if (sMax > 0) return `₹${toK(sMax)}`;
    return "Competitive";
  };

  const filterOptions = [
    { id: "all", label: "All Openings" },
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

  return (
    <section
      aria-label="Featured Verified Positions"
      className="py-20 bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans transition-colors duration-150 relative overflow-hidden border-t border-[var(--theme-border)]"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-[var(--theme-text)] uppercase tracking-wider text-[11px]">
                Active Recruiter Pipelines
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--theme-text)] tracking-tight leading-tight">
              Featured Opportunities
            </h2>
            <p className="text-sm sm:text-base text-[var(--theme-text-muted)] max-w-2xl font-normal leading-relaxed">
              Curated verified postings from technology, engineering, finance, and operations employers actively reviewing candidate profiles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[var(--theme-text)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] transition-all duration-200 shadow-sm group"
            >
              <span>Explore All Jobs</span>
              <ArrowRight className="w-4 h-4 text-[var(--theme-accent-silver)] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8 sm:mb-10">
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActiveFilter(opt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-sm"
                    : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]"
                }`}
              >
                <span>{opt.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent-silver)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] p-6 animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-muted)]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[var(--theme-surface-muted)] rounded w-3/4" />
                    <div className="h-3 bg-[var(--theme-surface-muted)] rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 bg-[var(--theme-surface-muted)] rounded w-4/5" />
                  <div className="h-3 bg-[var(--theme-surface-muted)] rounded w-full" />
                </div>
                <div className="h-9 bg-[var(--theme-surface-muted)] rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="text-center py-16 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] p-8">
            <p className="text-sm font-semibold text-[var(--theme-text-muted)]">
              No matching postings in this filter. Check back shortly.
            </p>
          </div>
        ) : (
          /* Editorial + Distinctive Job Cards Grid */
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
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group relative bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden"
                >
                  {/* Sheen line on top hover */}
                  <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    {/* Top Row: Company Logo & Bookmark */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] p-2 flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold text-[var(--theme-text)]">
                          {job.postedByImage ? (
                            <img
                              src={job.postedByImage}
                              alt="Company"
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : job.postedByCompany ? (
                            job.postedByCompany.charAt(0).toUpperCase()
                          ) : (
                            <Building2 className="w-5 h-5 text-[var(--theme-accent-silver)]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs sm:text-sm font-bold text-[var(--theme-text)] truncate group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors">
                              <CompanyDisplay
                                job={job}
                                fallback="Confidential Employer"
                              />
                            </p>
                            <ShieldCheck
                              className="w-3.5 h-3.5 text-silver shrink-0"
                              title="Verified Employer"
                            />
                          </div>
                          <p className="text-[11px] font-medium text-[var(--theme-text-muted)] truncate mt-0.5">
                            {job.industry || job.subdomain || "Verified Partner"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(e, job._id)}
                        className={`p-2 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                          isBookmarked
                            ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-border-silver)] text-amber-400"
                            : "bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)]"
                        }`}
                        title={isBookmarked ? "Remove bookmark" : "Save this job"}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isBookmarked ? "fill-amber-400" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)] leading-snug line-clamp-1 mb-3 group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors">
                      {job.title}
                    </h3>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] text-[11px]">
                        <MapPin className="w-3 h-3 text-[var(--theme-accent-silver)] shrink-0" />
                        <span className="truncate max-w-[110px]">{locationStr.split(",")[0]}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] text-[11px] capitalize">
                        <Briefcase className="w-3 h-3 text-[var(--theme-accent-silver)] shrink-0" />
                        <span>{jobTypeDisplay}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-[11px] font-bold">
                        <IndianRupee className="w-3 h-3 text-[var(--theme-accent-silver)] shrink-0" />
                        <span>{formattedSalary}</span>
                      </span>
                    </div>

                    {/* Brief description snippet */}
                    <p className="text-xs text-[var(--theme-text-muted)] line-clamp-2 leading-relaxed mb-4">
                      {cleanDescription || "View role specifications, qualifications, and direct hiring requirements."}
                    </p>
                  </div>

                  {/* Card Footer: Timestamp & Action */}
                  <div className="pt-3.5 border-t border-[var(--theme-border)] flex items-center justify-between text-xs font-medium text-[var(--theme-text-muted)]">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3 h-3 text-[var(--theme-text-subtle)]" />
                      <span>{formatTimeAgo(job.createdAt || job.postedAt)}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors">
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
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
