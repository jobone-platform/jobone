import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  IndianRupee,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Bookmark,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Award,
} from "lucide-react";
import CandidateLayout from "../components/candidate/CandidateLayout";
import JobDetailsModal from "../components/JobDetailsModal";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../routes/Context";

export default function RecommendedJobs() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [fallbackJobs, setFallbackJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  // Saved job IDs
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const stored = localStorage.getItem("jobone_saved_jobs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (e, jobId) => {
    e.stopPropagation();
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem("jobone_saved_jobs", JSON.stringify(next));
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error("Failed to update bookmark", err);
      }
      return next;
    });
  };

  const activeToken = useMemo(() => {
    if (token) return token;
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo"));
      return stored?.token || localStorage.getItem("userToken");
    } catch {
      return null;
    }
  }, [token]);

  // Fetch recommendations
  const fetchRecommendations = useCallback(
    async (allJobsList = [], force = false) => {
      if (!activeToken) {
        setLoading(false);
        return;
      }

      if (!force) {
        try {
          const cachedJobs = localStorage.getItem("aiRecommendedJobsCache");
          if (cachedJobs) {
            setRecommendedJobs(JSON.parse(cachedJobs));
            setLoading(false);
            return;
          }
        } catch (_err) {
          /* ignore */
        }
      }

      setRefreshing(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/ai/recommend-jobs`, {
          headers: { Authorization: `Bearer ${activeToken}` },
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
                title: fullJob?.title || aiJob.title || "Career Position",
              };
            })
            .filter((j) => j.title);

          setRecommendedJobs(richRecommendations);
          try {
            localStorage.setItem(
              "aiRecommendedJobsCache",
              JSON.stringify(richRecommendations)
            );
          } catch (_err) {
            /* ignore */
          }
        }
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeToken]
  );

  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/jobs?limit=100`);
        const jobs = data.data || data || [];
        setFallbackJobs(jobs);
        fetchRecommendations(jobs);
      } catch (err) {
        console.error("Failed to load jobs", err);
        setLoading(false);
      }
    };

    fetchAllJobs();
  }, [fetchRecommendations]);

  // Combined jobs list: recommendations first, then fallback
  const displayJobs = useMemo(() => {
    const baseList = recommendedJobs.length > 0 ? recommendedJobs : fallbackJobs;
    return baseList.filter((job) => {
      const title = (job.title || "").toLowerCase();
      const company = (job.postedByCompany || job.postedByName || "").toLowerCase();
      const industry = (job.industry || "").toLowerCase();

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!title.includes(q) && !company.includes(q)) return false;
      }

      if (selectedIndustry !== "all" && industry !== selectedIndustry.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [recommendedJobs, fallbackJobs, searchQuery, selectedIndustry]);

  // Extracted unique industries
  const availableIndustries = useMemo(() => {
    const baseList = recommendedJobs.length > 0 ? recommendedJobs : fallbackJobs;
    const inds = new Set();
    baseList.forEach((j) => {
      if (j.industry) inds.add(j.industry);
    });
    return Array.from(inds);
  }, [recommendedJobs, fallbackJobs]);

  const content = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans antialiased">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl border border-border bg-gradient-to-b from-surface via-surface to-surface-elevated relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-silver/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-silver/10 text-silver border border-silver/20">
              <Sparkles size={13} /> Algorithmic Talent Matching
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Curated Candidate Matches
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Openings matched to your verified skills, experience level, and domain profile using our talent intelligence engine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchRecommendations(fallbackJobs, true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-bold text-foreground hover:bg-surface-elevated transition-colors disabled:opacity-50 shadow-xs"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-silver" : ""} />
              <span>{refreshing ? "Re-evaluating..." : "Refresh Recommendations"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div className="relative w-full sm:w-80">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within matched roles..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border focus:border-silver focus:ring-1 focus:ring-silver/40 text-foreground placeholder:text-muted-foreground text-xs outline-none transition-all"
          />
        </div>

        {availableIndustries.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-silver shrink-0" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs font-medium outline-none focus:border-silver transition-colors cursor-pointer"
            >
              <option value="all">All Matched Industries</option>
              {availableIndustries.map((ind, i) => (
                <option key={i} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-surface border border-border animate-pulse p-6 space-y-4"
            />
          ))}
        </div>
      ) : displayJobs.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-border bg-surface text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground mx-auto">
            <Sparkles size={24} />
          </div>
          <h3 className="text-base font-bold text-foreground">No Recommendations Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            We could not find active recommendations matching this specific filter. You can explore the full open catalog.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Explore All Jobs <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayJobs.map((job) => {
            const companyName = job.postedByCompany || job.postedByName || "Verified Employer";
            const locationStr =
              typeof job.location === "object"
                ? job.location?.address || "Remote"
                : job.location || "Remote";
            const salaryStr = job.salary
              ? `₹${Number(job.salary).toLocaleString()}`
              : "Competitive";
            const isSaved = savedJobIds.includes(job._id);

            return (
              <div
                key={job._id}
                onClick={() => setSelectedJob(job)}
                className="group p-5 sm:p-6 rounded-2xl border border-border bg-surface hover:bg-surface-elevated hover:border-silver/40 transition-all cursor-pointer shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top: Match score & Bookmark */}
                  <div className="flex items-center justify-between gap-2">
                    {job.matchScore ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-silver/10 text-silver border border-silver/20">
                        <Award size={11} /> {job.matchScore}% Match
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                        Verified Position
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(e, job._id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved
                          ? "bg-silver/20 border-silver/40 text-silver"
                          : "border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                      }`}
                      title={isSaved ? "Saved" : "Save job"}
                      aria-label="Save job"
                    >
                      <Bookmark size={14} className={isSaved ? "fill-silver" : ""} />
                    </button>
                  </div>

                  {/* Company & Title */}
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <Building2 size={12} className="text-silver shrink-0" />
                      <span className="truncate">{companyName}</span>
                    </p>
                    <h3 className="font-bold text-base text-foreground tracking-tight group-hover:text-silver transition-colors mt-1 line-clamp-1">
                      {job.title}
                    </h3>
                  </div>

                  {/* Match Reason quote */}
                  {job.reason && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 bg-surface-elevated p-2 rounded-lg border border-border/60">
                      <span className="font-semibold text-silver">Insight:</span> {job.reason}
                    </p>
                  )}
                </div>

                {/* Footer Strip */}
                <div className="pt-3 border-t border-border/70 space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-silver" /> {locationStr}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-foreground">{salaryStr}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-silver font-medium group-hover:underline flex items-center gap-1">
                      Inspect Requisition <ArrowRight size={12} />
                    </span>
                    <Link
                      to={`/apply/${job._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 rounded-lg bg-foreground text-background font-bold text-xs hover:opacity-90 transition-opacity"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => {
            navigate(`/apply/${selectedJob._id}`);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );

  // If candidate session is active, render inside CandidateLayout
  if (activeToken) {
    return (
      <CandidateLayout
        activeTab="recommended"
        title="Recommended Jobs"
        breadcrumbs={[{ label: "Career Discovery", path: "/userdashboard" }]}
        onOpenJobDetails={setSelectedJob}
      >
        {content}
      </CandidateLayout>
    );
  }

  // Public fallback view
  return <div className="min-h-screen bg-background text-foreground">{content}</div>;
}
