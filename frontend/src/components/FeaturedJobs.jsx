import React, { useEffect, useState } from "react";
import axios from "axios";
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
} from "lucide-react";
import JobDetailsModal from "../components/JobDetailsModal";

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get(
          "https://jobone-mrpy.onrender.com/jobs",
        );
        const jobArray = data?.data || data || [];
        const latestJobs = Array.isArray(jobArray)
          ? jobArray.slice(-6).reverse()
          : [];
        setJobs(latestJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

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
      return job.location.address || "Location not specified";
    return job.location;
  };

  const getCompany = (job) =>
    job.postedByCompany || job.postedByName || "Company Confidential";

  if (loading) {
    return (
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-white rounded-3xl shadow-sm border border-slate-100 animate-pulse"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <section className="py-20 bg-[#F8FAFC] font-sans">
      {/* FACT: Injected custom animation for the transparent rotating gradient */}
      <style>{`
                @keyframes border-spin {
                    100% { transform: rotate(360deg); }
                }
                .border-spin-bg {
                    background: conic-gradient(from 90deg at 50% 50%, transparent 0%, transparent 75%, rgba(59, 130, 246, 0.9) 100%);
                    animation: border-spin 3s linear infinite;
                }
            `}</style>

      <div className="max-w-6xl mx-auto px-6">
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-blue-600 rounded-full"></span>
              <span className="text-blue-600 font-bold tracking-widest uppercase text-[10px] flex items-center gap-1">
                <Sparkles size={10} /> Recommended
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Opportunities
            </h2>
          </div>
        </div>

        {/* FACT: The grid uses "group/list" so we know when the user is hovering anywhere in the grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 group/list">
          {jobs.map((job) => {
            const companyName = getCompany(job);
            const locationStr = getLocation(job);

            // FACT: Safely extract the first job type since it is now an array in the new schema
            const jobTypeDisplay =
              Array.isArray(job.jobType) && job.jobType.length > 0
                ? job.jobType[0]
                : "Job";

            return (
              <motion.div
                key={job._id}
                onClick={() => setSelectedJob(job)}
                className="relative p-[2px] rounded-3xl overflow-hidden cursor-pointer group/card transition-all duration-500 ease-out group-hover/list:blur-[4px] group-hover/list:scale-[0.96] group-hover/list:opacity-60 hover:!blur-none hover:!scale-[1.02] hover:!opacity-100 hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.3)]"
              >
                {/* The Rotating Transparent Gradient */}
                <div className="absolute inset-[-100%] z-0 opacity-0 group-hover/card:opacity-100 border-spin-bg transition-opacity duration-500" />

                {/* Inner White Card */}
                <div className="relative z-10 bg-white rounded-[calc(1.5rem-2px)] p-6 h-full flex flex-col border border-slate-200/80 group-hover/card:border-transparent transition-colors duration-300">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                      {job.postedByImage ? (
                        <img
                          src={job.postedByImage}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        // FACT: Replaced the single character fallback with a professional building icon
                        <Building2 size={24} className="text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight truncate group-hover/card:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium truncate mt-0.5">
                        <CompanyDisplay job={job} fallback="Company Confidential" />
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-bold tracking-wide border border-slate-200/60 flex items-center gap-1.5">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="truncate max-w-[90px]">
                        {locationStr.split(",")[0]}
                      </span>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold tracking-wide border border-indigo-100/60 flex items-center gap-1.5 capitalize">
                      <Briefcase size={12} className="text-indigo-400" />{" "}
                      {jobTypeDisplay}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-wide border border-emerald-100/60 flex items-center gap-1.5">
                      <IndianRupee size={12} className="text-emerald-400" />
                      {/* FACT: Upgraded to use the new salaryMin and salaryMax range */}
                      {job.salaryMin === 0 && job.salaryMax === 0
                        ? "Unpaid"
                        : `${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k`}
                    </span>
                  </div>

                  {/* FACT: Strip HTML tags to prevent <h3> and <ul> from rendering raw text in the preview */}
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed font-medium">
                    {job.description?.replace(/<[^>]+>/g, " ")}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      {/* Fallback to postedAt if createdAt is missing based on schema */}
                      <Clock size={12} />{" "}
                      {formatTimeAgo(job.createdAt || job.postedAt)}
                    </span>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover/card:translate-x-1 transition-transform">
                      View Details <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

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
