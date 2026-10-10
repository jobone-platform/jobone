import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Building2,
  MapPin,
  Globe,
  Briefcase,
  ExternalLink,
  ArrowLeft,
  Clock,
  IndianRupee,
  Users,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react";
import JobDetailsModal from "../components/JobDetailsModal"; // FACT: Imported the premium modal

export default function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FACT: Added state to handle the popup modal
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const [profileRes, jobsRes] = await Promise.all([
          axios.get(`https://jobone-mrpy.onrender.com/employer/profile/${id}`),
          axios
            .get(`https://jobone-mrpy.onrender.com/jobs`)
            .catch(() => ({ data: [] })),
        ]);

        setCompany(profileRes.data);

        const allJobs = Array.isArray(jobsRes.data.data)
          ? jobsRes.data.data
          : jobsRes.data;
        const companyJobs = allJobs.filter(
          (j) =>
            j.postedBy === id &&
            j.status !== "pending_approval" &&
            j.status !== "rejected" &&
            j.status !== "disregarded",
        );
        setJobs(companyJobs);
      } catch (err) {
        console.error("Failed to load company profile", err);
        setError("Company profile is currently unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  const renderArray = (val) => {
    if (!val) return "";
    if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "";
    return String(val);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <Building2 className="mx-auto text-slate-300 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Profile Not Found
          </h2>
          <p className="text-slate-500 mb-6 font-medium">
            {error || "This employer profile does not exist."}
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Browse All Jobs
          </button>
        </div>
      </div>
    );
  }

  const companyDisplayLocation =
    typeof company.location === "object"
      ? company.location?.address
      : company.location;
  const logo = company.profilePicture || company.image;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 ">
      {/* --- HERO COVER SECTION --- */}
      <div className="h-48 sm:h-64 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 relative ">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 "></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-4 sm:left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm uppercase tracking-wide bg-black/20 hover:bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 space-y-8">
        {/* --- MAIN HEADER CARD --- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 flex flex-col sm:flex-row gap-6 items-center sm:items-end text-center sm:text-left"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-3xl border-4 border-white flex items-center justify-center shrink-0 shadow-xl overflow-hidden mt-[-4rem] sm:mt-[-5rem] relative z-20">
            {logo ? (
              <img
                src={logo}
                alt={company.companyName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 size={64} className="text-slate-300" />
            )}
          </div>

          <div className="flex-1 pb-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              {company.companyName || company.name}
            </h1>
            <p className="text-slate-500 font-bold text-sm flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin size={16} className="text-slate-400" />{" "}
              {companyDisplayLocation || "Location not provided"}
            </p>
          </div>

          {company.companyWebsite && (
            <div className="pb-2">
              <a
                href={
                  company.companyWebsite.startsWith("http")
                    ? company.companyWebsite
                    : `https://${company.companyWebsite}`
                }
                target="_blank"
                rel="norenoopener noreferrer"
                className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
              >
                <Globe size={18} /> Visit Website <ExternalLink size={14} />
              </a>
            </div>
          )}
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: ABOUT & JOBS --- */}
          <div className="lg:col-span-2 space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200"
            >
              <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                About the Company
              </h2>
              {company.description ? (
                <div className="prose prose-sm sm:prose-base max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed font-medium">
                  {company.description}
                </div>
              ) : (
                <p className="text-slate-400 italic">
                  No description provided by this employer.
                </p>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
                Active Openings{" "}
                <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl text-lg ml-2">
                  {jobs.length}
                </span>
              </h2>

              {jobs.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
                  <Briefcase
                    className="mx-auto text-slate-300 mb-4"
                    size={48}
                  />
                  <h3 className="text-lg font-bold text-slate-800">
                    No active listings
                  </h3>
                  <p className="text-slate-500 font-medium mt-1">
                    This company currently has no open positions.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {jobs.map((job) => {
                    const jobLocation =
                      typeof job.location === "object"
                        ? job.location.address
                        : job.location || "Remote";
                    return (
                      <div
                        key={job._id}
                        onClick={() => setSelectedJob(job)} // FACT: Now opens the modal instead of redirecting!
                        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group flex flex-col sm:flex-row justify-between gap-5"
                      >
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 line-clamp-1">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <MapPin size={14} className="text-slate-400" />{" "}
                              <span className="truncate max-w-[120px] sm:max-w-[200px]">
                                {jobLocation}
                              </span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 capitalize">
                              <Briefcase size={14} /> {renderArray(job.jobType)}
                            </span>
                            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                              <IndianRupee size={14} />{" "}
                              {job.salaryAmount?.toLocaleString() ||
                                job.salary?.toLocaleString() ||
                                "TBD"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end min-w-fit pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={12} />{" "}
                            {formatTimeAgo(job.postedAt || job.createdAt)}
                          </span>
                          <button className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2 rounded-xl sm:opacity-0 sm:group-hover:opacity-100 transition-all border border-indigo-100 shadow-sm mt-2">
                            View Role
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.section>
          </div>

          {/* --- RIGHT COLUMN: COMPANY SNAPSHOT SIDEBAR --- */}
          <div className="lg:col-span-1">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white sticky top-24 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4 relative z-10">
                Company Snapshot
              </h3>

              <div className="space-y-5 relative z-10">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <UserCircle size={12} /> Representative
                  </p>
                  <p className="text-sm font-extrabold text-white">
                    {company.name || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail size={12} /> Official Email
                  </p>
                  <p className="text-sm font-medium text-slate-200 break-all">
                    {company.email ? (
                      <a
                        href={`mailto:${company.email}`}
                        className="hover:text-indigo-300 transition-colors"
                      >
                        {company.email}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone size={12} /> Contact Number
                  </p>
                  <p className="text-sm font-medium text-slate-200">
                    {company.phone ? (
                      <a
                        href={`tel:${company.phone}`}
                        className="hover:text-indigo-300 transition-colors"
                      >
                        {company.phone}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
                <div className="h-px bg-white/10 my-2"></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Building2 size={12} /> Industry
                  </p>
                  <p className="text-sm font-bold text-white">
                    {company.industry || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Users size={12} /> Company Size
                  </p>
                  <p className="text-sm font-medium text-slate-200">
                    {company.companySize
                      ? `${company.companySize} Employees`
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>

      {/* FACT: Integrated Job Details Modal directly into the page */}
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
