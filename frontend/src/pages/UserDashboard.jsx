import React, { useState, useEffect } from "react";
import axios from "axios";
import CompanyDisplay from "../components/CompanyDisplay";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Building2,
  ArrowRight,
  Sparkles,
  Users,
  Globe,
} from "lucide-react";
import {
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBuilding,
  FaUsers,
  FaGlobe,
} from "react-icons/fa";

// Import your existing sub-components
import Hero from "../userdashboard/Hero";
import FeaturedJobs from "../userdashboard/FeaturedJobs";
import Footer from "../components/Footer";
import JobCategories from "../components/JobCategories";
import JobsAroundMe from "../components/JobsAroundMe";
import JobDetailsModal from "../components/JobDetailsModal"; // Import Modal

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [allFetchedJobs, setAllFetchedJobs] = useState([]);
  const [lastFetchedTime, setLastFetchedTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // State for Modal
  const navigate = useNavigate();

  const fetchRecommendations = async (allJobsList, force = false) => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (!stored) return;
      const token = JSON.parse(stored)?.token;
      if (!token) return;

      if (!force) {
        const cachedJobs = localStorage.getItem("aiRecommendedJobsCache");
        const cachedTime = localStorage.getItem("aiRecommendedJobsTime");
        if (cachedJobs && cachedTime) {
          setRecommendedJobs(JSON.parse(cachedJobs));
          setLastFetchedTime(cachedTime);
          return;
        }
      }

      setLoadingRecommendations(true);
      const { data } = await axios.get(
        "https://jobone-if7l.onrender.com/ai/recommend-jobs",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (data && data.recommendedJobs) {
        const richRecommendations = data.recommendedJobs
          .map((aiJob) => {
            const fullJob = allJobsList.find((j) => j._id === aiJob.jobId);
            return {
              ...fullJob,
              matchScore: aiJob.matchScore,
              reason: aiJob.reason,
              _id: aiJob.jobId,
              title: fullJob?.title || aiJob.title,
            };
          })
          .filter((j) => j.postedByCompany || j.postedByName); // Ensure we found the full job

        setRecommendedJobs(richRecommendations);

        const now = new Date().toLocaleString();
        setLastFetchedTime(now);
        localStorage.setItem(
          "aiRecommendedJobsCache",
          JSON.stringify(richRecommendations),
        );
        localStorage.setItem("aiRecommendedJobsTime", now);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleRefreshAI = () => {
    localStorage.removeItem("aiRecommendedJobsCache");
    localStorage.removeItem("aiRecommendedJobsTime");
    if (allFetchedJobs.length > 0) {
      fetchRecommendations(allFetchedJobs, true);
    }
  };

  // --- FETCH FEATURED & RECOMMENDED JOBS ---
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await axios.get(
          "https://jobone-mrpy.onrender.com/jobs?limit=100",
        );
        const allJobs = data.data || data || [];
        setAllFetchedJobs(allJobs);

        // Take the first 6 jobs as "Featured"
        setFeaturedJobs(allJobs.slice(0, 6));

        // Fetch recommendations asynchronously
        fetchRecommendations(allJobs);
      } catch (err) {
        console.error("Failed to load featured jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Helper to safely get location string
  const getLocationStr = (job) => {
    if (!job) return "Remote";
    if (typeof job.location === "object")
      return job.location.address || "Remote";
    return job.location || "Remote";
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 mt-[-80px]">
      {/* 1. HERO SECTION */}
      <div className="relative bg-white shadow-sm border-b border-slate-100 z-10">
        <Hero />
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="w-full">
        {/* 3. JOB CATEGORIES */}
        <JobCategories />

        {/* 4. JOBS NEAR ME */}
        <section
          id="jobs-near-me"
          className="py-20 bg-slate-900 text-white relative overflow-hidden"
        >
          <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-0">
            <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-400" /> Jobs Near You
                </h2>
                <p className="text-slate-400 mt-3 text-lg max-w-xl">
                  Why commute? Find opportunities in your neighborhood.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-1.5 shadow-2xl relative z-0">
              <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <JobsAroundMe onJobClick={setSelectedJob} />
              </div>
            </div>
          </div>
        </section>

        {/* RECOMMENDED JOBS (AI MATCHED) */}
        {loadingRecommendations ? (
          <section id="ai-recommended-jobs" className="py-16 px-4 sm:px-6 bg-indigo-50 border-y border-indigo-100">
            <div className="max-w-7xl mx-auto">
              <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider bg-white border border-indigo-100 px-3 py-1 rounded-full flex items-center gap-2 w-fit shadow-sm">
                    <Sparkles size={12} className="text-indigo-500 animate-pulse" /> Generating AI Recommendations...
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 mt-3">Recommended Jobs</h2>
                  <p className="text-slate-600 mt-2">Personalized matches based on your skills and profile experience.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col h-full relative overflow-hidden animate-pulse">
                    <div className="flex items-start justify-between mb-4 mt-2">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100"></div>
                      <div className="w-16 h-6 rounded-lg bg-slate-100 border border-slate-200 mt-1"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-slate-200 rounded-md mb-1"></div>
                    <div className="h-4 w-1/2 bg-slate-100 rounded-md mb-4"></div>
                    <div className="p-3.5 bg-indigo-50/50 rounded-xl mb-5 h-10 w-full border border-indigo-50/80"></div>
                    <div className="mt-auto space-y-3">
                      <div className="h-4 w-1/2 bg-slate-100 rounded-md"></div>
                      <div className="h-4 w-1/3 bg-slate-100 rounded-md"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : recommendedJobs.length > 0 ? (
          <section
            id="ai-recommended-jobs"
            className="py-16 px-4 sm:px-6 bg-indigo-50 border-y border-indigo-100"
          >
            <div className="max-w-7xl mx-auto">
              <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider bg-white border border-indigo-100 px-3 py-1 rounded-full flex items-center gap-2 w-fit shadow-sm">
                    <Sparkles size={12} className="text-indigo-500" /> AI
                    Matched For You
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 mt-3">
                    Recommended Jobs
                  </h2>
                  <p className="text-slate-600 mt-2">
                    Personalized matches based on your skills and profile
                    experience.
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end text-sm">
                  {lastFetchedTime && (
                    <span className="text-slate-500 mb-2">
                      Last fetched:{" "}
                      <span className="font-semibold text-slate-700">
                        {lastFetchedTime}
                      </span>
                    </span>
                  )}
                  <button
                    onClick={handleRefreshAI}
                    disabled={loadingRecommendations}
                    className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <Sparkles
                      size={16}
                      className={loadingRecommendations ? "animate-spin" : ""}
                    />
                    Refresh Recommendations
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJob(job)}
                    className={`bg-white p-6 rounded-3xl border shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden ${
                      job.matchScore > 70
                        ? "border-amber-400 hover:border-amber-500 shadow-amber-100/50"
                        : "border-indigo-100 hover:border-indigo-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0 right-0 text-[10px] font-extrabold px-3 py-1.5 rounded-bl-xl shadow-sm ${
                        job.matchScore > 70
                          ? "bg-gradient-to-r from-amber-300 to-yellow-500 text-amber-950"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      {job.matchScore}% Match
                    </div>
                    <div className="flex items-start justify-between mb-4 mt-2">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl font-bold text-indigo-600 border border-indigo-100 shadow-inner">
                        {(
                          job.postedByCompany ||
                          job.postedByName ||
                          "C"
                        ).charAt(0)}
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg uppercase tracking-wide border border-slate-200 mt-1">
                        {Array.isArray(job.jobType)
                          ? job.jobType.join(", ")
                          : job.jobType}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-bold mb-4">
                      <CompanyDisplay
                        job={job}
                        fallback="Company Confidential"
                        showVia={false}
                      />
                    </p>

                    <div className="p-3.5 bg-indigo-50/50 rounded-xl mb-5 border border-indigo-50/80">
                      <p className="text-xs font-bold text-indigo-800 leading-snug">
                        <Sparkles
                          size={12}
                          className="inline mr-1 text-indigo-500"
                        />
                        {job.reason}
                      </p>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                        <MapPin size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate">{getLocationStr(job)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                        <IndianRupee
                          size={16}
                          className="text-slate-400 shrink-0"
                        />
                        <span>
                          {job.salaryAmount === 0 ||
                          (job.salaryMin === 0 && job.salaryMax === 0)
                            ? "Unpaid"
                            : job.salaryAmount?.toLocaleString() ||
                              job.salaryMin?.toLocaleString() ||
                              job.salary?.toLocaleString() ||
                              "TBD"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* 5. FEATURED JOBS (REAL DATA) */}
        <section className="py-20 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-2 w-fit">
                  <Sparkles size={12} /> Hot Jobs
                </span>
                <h2 className="text-3xl font-bold text-slate-900 mt-3">
                  Featured Opportunities
                </h2>
              </div>
              <Link
                to="/jobs"
                className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 bg-white rounded-2xl animate-pulse shadow-sm"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJob(job)} // Open Modal
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-600">
                        {(
                          job.postedByCompany ||
                          job.postedByName ||
                          "C"
                        ).charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase">
                        {job.jobType}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mb-4">
                      <CompanyDisplay
                        job={job}
                        fallback="Company Confidential"
                        showVia={false}
                      />
                    </p>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={16} className="text-slate-400" />
                        <span className="truncate">{getLocationStr(job)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <IndianRupee size={16} className="text-slate-400" />
                        <span>
                          {job.salary ? job.salary.toLocaleString() : "N/A"} /
                          month
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={16} className="text-slate-400" />
                        <span>{job.dailyWorkingHours} hrs/day</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
function StatItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-3 bg-slate-100 rounded-xl text-xl">{icon}</div>
      <div className="text-left">
        <p className="text-2xl font-bold text-slate-900 leading-none">
          {value}
        </p>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

function SocialIcon({ href, icon }) {
  return (
    <a
      href={href}
      className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
    >
      {icon}
    </a>
  );
}
